const fetch = require("node-fetch");
const core = require("@actions/core");
const github = require("@actions/github");
const { Octokit } = require("@octokit/core");

const githubToken = core.getInput("github-token");
const octokit = new Octokit({ auth: githubToken });

fetch("https://db.ygoprodeck.com/api/v7/randomcard.php")
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    const cardName = data.name;
    const imageUrl = data.card_images[0].image_url;

    octokit.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/comments",
      {
        issue_number: github.context.issue.number,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        body: `_**Draw "${cardName}" !**_\n\n![${cardName}](${imageUrl})`,
      }
    );
  })
  .catch((error) => {
    core.setFailed(error.message);
  });
