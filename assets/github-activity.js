(function () {
  const username = "AasishDairelSahayaGrinspan";
  const listEl = document.getElementById("github-activity-list");
  const statusEl = document.getElementById("github-activity-status");
  const totalEl = document.getElementById("github-activity-total");
  const graphEl = document.getElementById("github-graph");
  const graphStatusEl = document.getElementById("github-graph-status");
  const contribTotalEl = document.getElementById("github-contrib-total");

  if (!listEl || !statusEl || !totalEl) {
    return;
  }

  function mapLevelToGithubScale(level, count) {
    if (typeof level === "number") {
      return Math.max(0, Math.min(4, level));
    }

    if (count <= 0) {
      return 0;
    }
    if (count <= 2) {
      return 1;
    }
    if (count <= 5) {
      return 2;
    }
    if (count <= 9) {
      return 3;
    }
    return 4;
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  async function loadContributionGraph() {
    if (!graphEl || !graphStatusEl || !contribTotalEl) {
      return;
    }

    graphStatusEl.textContent = "Loading contribution graph...";

    try {
      const response = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
        {
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error("Contributions API request failed");
      }

      const payload = await response.json();
      const contributions = Array.isArray(payload.contributions)
        ? payload.contributions
        : [];

      if (contributions.length === 0) {
        throw new Error("No contributions available");
      }

      const heatmap = document.createElement("div");
      heatmap.className = "gh-heatmap";

      contributions.forEach((entry) => {
        const level = mapLevelToGithubScale(entry.level, entry.count);
        const day = document.createElement("span");
        day.className = `gh-day gh-l${level}`;
        day.title = `${entry.count} contributions on ${formatDate(entry.date)}`;
        heatmap.appendChild(day);
      });

      graphEl.innerHTML = "";
      graphEl.appendChild(heatmap);

      const totalCount = payload.total?.lastYear;
      if (typeof totalCount === "number") {
        contribTotalEl.textContent = `${totalCount} contributions in the last year`;
      } else {
        contribTotalEl.textContent = "Past 12 months";
      }

      graphStatusEl.textContent = "Contribution heatmap from your GitHub profile activity.";
    } catch (error) {
      graphEl.innerHTML = '<p class="gh-item-error">Contribution graph unavailable right now.</p>';
      contribTotalEl.textContent = "Past 12 months";
      graphStatusEl.textContent = "Could not load contribution graph right now.";
    }
  }

  function relativeTimeFromNow(dateString) {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    const diffMs = Math.max(0, now - then);
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < hour) {
      const minutes = Math.max(1, Math.floor(diffMs / minute));
      return `${minutes}m ago`;
    }

    if (diffMs < day) {
      const hours = Math.floor(diffMs / hour);
      return `${hours}h ago`;
    }

    const days = Math.floor(diffMs / day);
    return `${days}d ago`;
  }

  function describeEvent(event) {
    const repo = event.repo ? event.repo.name : "a repository";

    switch (event.type) {
      case "PushEvent": {
        const commitCountFromList = Array.isArray(event.payload?.commits)
          ? event.payload.commits.length
          : 0;
        const commitCountFromSize = Number.isFinite(event.payload?.size)
          ? Number(event.payload.size)
          : 0;
        const commitCountFromDistinctSize = Number.isFinite(event.payload?.distinct_size)
          ? Number(event.payload.distinct_size)
          : 0;

        const commitCount =
          commitCountFromList ||
          commitCountFromDistinctSize ||
          commitCountFromSize;

        if (commitCount > 0) {
          const commitLabel = commitCount === 1 ? "commit" : "commits";
          return `Pushed ${commitCount} ${commitLabel} to ${repo}`;
        }

        return `Pushed updates to ${repo}`;
      }
      case "CreateEvent":
        return `Created ${event.payload?.ref_type || "resource"} in ${repo}`;
      case "PullRequestEvent":
        return `${event.payload?.action || "Updated"} pull request in ${repo}`;
      case "IssuesEvent":
        return `${event.payload?.action || "Updated"} issue in ${repo}`;
      case "IssueCommentEvent":
        return `Commented on issue in ${repo}`;
      case "WatchEvent":
        return `Starred ${repo}`;
      case "ForkEvent":
        return `Forked ${repo}`;
      default:
        return `${event.type.replace("Event", "")} on ${repo}`;
    }
  }

  function renderError(message) {
    listEl.innerHTML = `<li class="gh-item-error">${message}</li>`;
    statusEl.textContent = "Unable to load live activity right now.";
    totalEl.textContent = "-";
  }

  async function loadRepoFallback() {
    const repoResponse = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=8`,
      {
        headers: {
          Accept: "application/vnd.github+json"
        },
        cache: "no-store"
      }
    );

    if (!repoResponse.ok) {
      throw new Error("GitHub repos fallback request failed");
    }

    const repos = await repoResponse.json();
    const recentRepos = Array.isArray(repos) ? repos.slice(0, 8) : [];

    if (recentRepos.length === 0) {
      renderError("No recent public activity found.");
      return;
    }

    listEl.innerHTML = recentRepos
      .map((repo) => {
        const when = relativeTimeFromNow(repo.pushed_at || repo.updated_at);
        return `
          <li class="gh-item">
            <p>Updated repository ${repo.name}</p>
            <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.full_name}</a>
            <span>${when}</span>
          </li>
        `;
      })
      .join("");

    statusEl.textContent = "Showing recent repository updates.";
    totalEl.textContent = `${recentRepos.length} recent updates`;
  }

  async function loadGithubActivity() {
    statusEl.textContent = "Loading latest public GitHub events...";

    try {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/events/public`,
        {
          headers: {
            Accept: "application/vnd.github+json"
          },
          cache: "no-store"
        }
      );

      if (!response.ok) {
        throw new Error(`GitHub events API request failed (${response.status})`);
      }

      const events = await response.json();
      const recent = Array.isArray(events) ? events.slice(0, 8) : [];

      if (recent.length === 0) {
        await loadRepoFallback();
        return;
      }

      listEl.innerHTML = recent
        .map((event) => {
          const text = describeEvent(event);
          const when = relativeTimeFromNow(event.created_at);
          const repoLink = event.repo?.name
            ? `https://github.com/${event.repo.name}`
            : `https://github.com/${username}`;

          return `
            <li class="gh-item">
              <p>${text}</p>
              <a href="${repoLink}" target="_blank" rel="noopener noreferrer">${event.repo?.name || "Open on GitHub"}</a>
              <span>${when}</span>
            </li>
          `;
        })
        .join("");

      statusEl.textContent = "Live feed updates every 2 minutes.";
      totalEl.textContent = `${recent.length} recent events`;
    } catch (error) {
      try {
        await loadRepoFallback();
      } catch (fallbackError) {
        renderError("Could not fetch GitHub activity. Please try again in a moment.");
      }
    }
  }

  loadContributionGraph();
  loadGithubActivity();
  setInterval(loadGithubActivity, 120000);
})();
