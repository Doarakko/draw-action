import fetch from "node-fetch";
import { getInput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { Octokit } from "@octokit/core";

async function run() {
  try {
    const githubToken = getInput("github-token");
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
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: `_**Draw "${cardName}" !**_\n\n![${cardName}](${imageUrl})`,
          }
        );
      });
  } catch (error) {
    setFailed(error.message);
  }
}

run();
