require('dotenv').config();
const PAT = process.env.GITHUB_SYNC_PAT;

async function query(q) {
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { 'Authorization': `token ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q })
  });
  return r.json();
}

const getProjectInfo = `
query {
  user(login: "aniruddh2003") {
    projectsV2(first: 5) {
      nodes {
        id
        title
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
        fields(first: 20) {
          nodes {
            ... on ProjectV2IterationField {
              id
              name
              configuration {
                iterations {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  }
}
`;

query(getProjectInfo).then(d => {
  console.log(JSON.stringify(d, null, 2));
}).catch(console.error);
