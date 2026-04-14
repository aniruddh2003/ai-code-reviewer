const fs = require('fs');
const path = require('path');
require('dotenv').config();

const REPO_FULL = "aniruddh2003/ai-code-reviewer";
const [OWNER, REPO] = REPO_FULL.split('/');
const PAT = process.env.GITHUB_SYNC_PAT;
const STATE_FILE = path.join(__dirname, '../.agent/memory/github_sync_state.json');

// Project V2 Configuration (CodeRadar)
const PROJECT_ID = "PVT_kwHOBp79Ys4BUoRe";
const ITERATION_FIELD_ID = "PVTIF_lAHOBp79Ys4BUoRezhBvLo0";
const ITERATION_ID = "381c7c80";

async function sync() {
    if (!PAT) {
        console.error("❌ GITHUB_SYNC_PAT is missing in .env");
        process.exit(1);
    }

    const featureDir = getLatestFeatureDir();
    if (!featureDir) {
        console.error("❌ No feature directory found in specs/");
        process.exit(1);
    }

    const tasksContent = fs.readFileSync(path.join(featureDir, 'tasks.md'), 'utf8');
    const phases = parseTasks(tasksContent);
    const state = loadState();
    const featureName = path.basename(featureDir);

    if (!state[featureName]) state[featureName] = {};

    console.log(`🚀 Pro-Sync: ${featureName} -> GitHub...`);

    for (const phase of phases) {
        const phaseKey = phase.title;
        let phaseData = state[featureName][phaseKey];
        let phaseIssueNumber = typeof phaseData === 'object' ? phaseData.number : phaseData;
        let phaseIssueId = typeof phaseData === 'object' ? phaseData.id : null;
        
        const rawLabel = phase.title.split(': ')[1] || 'Main';
        const cleanLabel = `story: ${rawLabel.split(' (')[0].substring(0, 40)}`;

        // 1. Ensure Phase Issue (Parent) exists
        if (!phaseIssueNumber) {
            console.log(`  - Creating Parent Phase: ${phase.title}...`);
            const createdPhase = await githubRequest('POST', `/repos/${REPO_FULL}/issues`, {
                title: phase.title,
                body: "Parent tracking issue.",
                labels: ['phase', 'speckit', 'iteration: current', 'automated'],
                assignees: [OWNER]
            });
            if (createdPhase) {
                phaseIssueNumber = createdPhase.number;
                phaseIssueId = createdPhase.node_id;
                state[featureName][phaseKey] = { number: phaseIssueNumber, id: phaseIssueId };
                saveState(state);
                await syncWithProject(phaseIssueId, phaseIssueNumber);
            }
        } else {
            // Ensure project iteration sync for existing phases
            if (phaseIssueId) {
                await syncWithProject(phaseIssueId, phaseIssueNumber);
            }
        }

        if (!phaseIssueNumber) continue;

        const childTaskLinks = [];

        // 2. Process all tasks in this Phase
        for (const task of phase.tasks) {
            let taskData = state[featureName][task.id];
            let taskIssueNumber = typeof taskData === 'object' ? taskData.number : taskData;
            let taskIssueId = typeof taskData === 'object' ? taskData.id : null;
            
            const desiredStatus = task.completed ? 'closed' : 'open';

            if (!taskIssueNumber) {
                console.log(`    - Creating Task: ${task.id}...`);
                const taskBody = `Task ID: **${task.id}**\nPart of: #${phaseIssueNumber}\n\nSynced from Speckit tasks.md\n\n---\n*Automated Speckit Sync*`;
                const createdTask = await githubRequest('POST', `/repos/${REPO_FULL}/issues`, {
                    title: `[${task.id}] ${task.title}`,
                    body: taskBody,
                    labels: ['task', 'speckit', cleanLabel, 'iteration: current', 'automated'],
                    assignees: [OWNER]
                });
                
                if (createdTask) {
                    taskIssueNumber = createdTask.number;
                    taskIssueId = createdTask.id;
                    state[featureName][task.id] = { number: taskIssueNumber, id: taskIssueId };
                    saveState(state);
                    
                    // Link as sub-issue
                    await githubRequest('POST', `/repos/${REPO_FULL}/issues/${phaseIssueNumber}/sub_issues`, {
                        sub_issue_id: taskIssueId
                    });
                    
                    // Sync with Project board
                    await syncWithProject(taskIssueId, taskIssueNumber);
                    console.log(`      ✅ Created & Linked Task #${taskIssueNumber}`);
                }
            } else {
                // 3. Update existing task status, labels, and assignee
                await githubRequest('PATCH', `/repos/${REPO_FULL}/issues/${taskIssueNumber}`, {
                    state: desiredStatus,
                    labels: ['task', 'speckit', cleanLabel, 'iteration: current', 'automated'],
                    assignees: [OWNER]
                });
                
                // Ensure project sync
                if (taskIssueId) {
                    await syncWithProject(taskIssueId, taskIssueNumber);
                }

                // Ensure link exists (for legacy issues being upgraded)
                if (taskIssueId && !state[featureName][task.id].linked) {
                    await githubRequest('POST', `/repos/${REPO_FULL}/issues/${phaseIssueNumber}/sub_issues`, {
                        sub_issue_id: taskIssueId
                    });
                    state[featureName][task.id].linked = true;
                    saveState(state);
                }
            }

            if (taskIssueNumber) {
                childTaskLinks.push(`- [${task.completed ? 'x' : ' '}] #${taskIssueNumber} - ${task.title}`);
            }
        }

        // 4. Update Parent Phase Body with Task List Checklist
        const phaseStatus = phase.completed ? 'closed' : 'open';
        const updatedPhaseBody = `Tracker for **${phase.title}**\n\n### Task List\n${childTaskLinks.join('\n')}\n\n---\n*Automated Speckit Sync*`;
        
        await githubRequest('PATCH', `/repos/${REPO_FULL}/issues/${phaseIssueNumber}`, {
            body: updatedPhaseBody,
            state: phaseStatus,
            labels: ['phase', 'speckit', cleanLabel, 'iteration: current', 'automated'],
            assignees: [OWNER]
        });
        
        console.log(`  ✅ Synced Phase #${phaseIssueNumber} status and hierarchy.`);
    }
}

async function syncWithProject(issueNodeId, issueNumber) {
    // 1. Find or Add item to project
    const findItemQuery = `
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 50) {
            nodes {
              id
              content {
                ... on Issue {
                  number
                }
              }
            }
          }
        }
      }
    }`;
    
    const projectData = await graphqlRequest(findItemQuery, { projectId: PROJECT_ID });
    let item = projectData?.data?.node?.items?.nodes?.find(n => n.content?.number === issueNumber);
    
    if (!item) {
        console.log(`    - Adding Issue #${issueNumber} to Project board...`);
        const addItemMutation = `
        mutation($projectId: ID!, $contentId: ID!) {
          addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
            item { id }
          }
        }`;
        const added = await graphqlRequest(addItemMutation, { projectId: PROJECT_ID, contentId: issueNodeId });
        item = added?.data?.addProjectV2ItemById?.item;
    }

    if (item) {
        const updateFieldMutation = `
        mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: String!) {
          updateProjectV2ItemFieldValue(input: {
            projectId: $projectId,
            itemId: $itemId,
            fieldId: $fieldId,
            value: { iterationId: $value }
          }) {
            projectV2Item { id }
          }
        }`;
        await graphqlRequest(updateFieldMutation, {
            projectId: PROJECT_ID,
            itemId: item.id,
            fieldId: ITERATION_FIELD_ID,
            value: ITERATION_ID
        });
    }
}

async function githubRequest(method, endpoint, data) {
    const url = `https://api.github.com${endpoint}`;
    const response = await fetch(url, {
        method,
        headers: {
            'Authorization': `token ${PAT}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Speckit-Sync-Bot'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error(`❌ GitHub API Error (${method} ${endpoint}): ${response.status}`, err);
        return null;
    }

    return await response.json();
}

async function graphqlRequest(query, variables) {
    const r = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            'Authorization': `token ${PAT}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Speckit-Sync-Bot'
        },
        body: JSON.stringify({ query, variables })
    });
    if (!r.ok) {
        console.error(`❌ GraphQL Error: ${r.status}`);
        return null;
    }
    return r.json();
}

function getLatestFeatureDir() {
    const specsDir = path.join(__dirname, '../specs');
    const dirs = fs.readdirSync(specsDir)
        .map(d => path.join(specsDir, d))
        .filter(d => fs.statSync(d).isDirectory())
        .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    return dirs[0];
}

function parseTasks(content) {
    const phases = [];
    const lines = content.split('\n');
    let currentPhase = null;

    for (const line of lines) {
        const phaseMatch = line.match(/^## Phase (\d+): (.+)/);
        if (phaseMatch) {
            if (currentPhase) phases.push(currentPhase);
            currentPhase = {
                title: `Phase ${phaseMatch[1]}: ${phaseMatch[2]}`,
                completed: false,
                tasks: []
            };
            continue;
        }

        const taskMatch = line.match(/^- \[([ x/])\] (T\d+) (.+)/);
        if (taskMatch && currentPhase) {
            currentPhase.tasks.push({ 
                id: taskMatch[2], 
                title: taskMatch[3], 
                completed: taskMatch[1] === 'x' 
            });
        }
    }
    if (currentPhase) phases.push(currentPhase);
    
    phases.forEach(p => {
        if (p.tasks.length > 0 && p.tasks.every(t => t.completed)) p.completed = true;
    });
    
    return phases;
}

function loadState() {
    try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
    catch { return {}; }
}

function saveState(state) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

sync().catch(console.error);
