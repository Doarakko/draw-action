import fetch from "node-fetch";
import { getInput, setFailed } from "@actions/core";
import { context } from "@actions/github";
import { Octokit } from "@octokit/core";

async function run() {
  try {
    const githubToken = getInput("github-token");
    const octokit = new Octokit({ auth: githubToken });

    fetch("https://db.ygoprodeck.com/api/v7/cardinfo.php?num=1&offset=0&sort=random&cachebust")
      .then((response) => {
        if(!response.ok){
          console.error('response.ok:', response.ok);
          console.error('esponse.status:', response.status);
          console.error('esponse.statusText:', response.statusText);
          throw new Error("Failed to fetch random card");
        }
        return response.json();
      })
      .then((data) => {
        if (!(('data' in data) && Array.isArray(data["data"]) && data["data"].length > 0)) {
          throw new Error("Failed to get card");
        }
        const card = data["data"][0];
        const cardName = card.name;
        if (!(('card_images' in card) && Array.isArray(card.card_images) && card.card_images.length > 0)) {
          throw new Error("Failed to get card images");
        }
        const imageUrl = card.card_images[0].image_url;

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
