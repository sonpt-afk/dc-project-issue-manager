

export const fetchProjects = async () => {
  const response = await requestJira("/rest/api/3/project");
  console.log("🚀 ~ fetchProjects ~ response:", response)
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch projects:", errorText);
    throw new Error(`Failed to fetch projects: ${response.status}`);
  }
  return response.json();
};

export const fetchIssuesByProject = async (projectKey, startAt = 0, maxResults = 50, includeParent = false, fetchAllPages = false) => {
    if(!projectKey){
        console.log('Project key is required to fetch issues');
        return {
            issues: [],
            total: 0
        };
    }

    const jql = `project = "${projectKey}" ORDER BY created DESC`;
    let fields = "summary, status, assignee, issueType";
    if(includeParent){
        fields += ",parent";
    }
     if (!fetchAllPages) {
    // Original behavior - fetch single page
    const response = await requestJira(
      `/rest/api/3/search?jql=${encodeURIComponent(
        jql
      )}&startAt=${startAt}&maxResults=${maxResults}&fields=${fields}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Failed to fetch issues for project ${projectKey}:`,
        errorText
      );
      throw new Error(`Failed to fetch issues: ${response.status}`);
    }

    const result = await response.json();
    return {
      issues: result.issues,
      total: result.total,
    };
  } else {
    // New behavior - fetch all pages
    let allIssues = [];
    let currentStartAt = startAt;
    let hasMore = true;
    let total = 0;

    try {
      while (hasMore) {
        const response = await requestJira(
          `/rest/api/3/search?jql=${encodeURIComponent(
            jql
          )}&startAt=${currentStartAt}&maxResults=${maxResults}&fields=${fields}`
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Failed to fetch issues for project ${projectKey}:`,
            errorText
          );
          throw new Error(`Failed to fetch issues: ${response.status}`);
        }

        const result = await response.json();

        if (!result.issues || result.issues.length === 0) {
          break;
        }

        allIssues = [...allIssues, ...result.issues];
        total = result.total;

        currentStartAt += maxResults;
        hasMore = allIssues.length < total;
      }

      return {
        issues: allIssues,
        total: total,
      };
    } catch (error) {
      console.error("Error fetching all issues:", error);
      throw error;
    }
  }
}

export const updateIssue = async (issueId, updateData) => {
    const response = await requestJira(`/rest/api/3/issue/${issueId}`,{
        method: 'PUT',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updateData),
    });

    if(!response.ok){
        const errorText = await response.text();
        console.error(`Failed to update issue ${issueId}:`, errorText);
        throw new Error(`Failed to update issue: ${errorText}`);
    }

    return response;
}

export const deleteIssue = async (issueId) => {
  const response = await requestJira(`/rest/api/3/issue/${issueId}`, {
    method: "DELETE",
  });

  return response;
};

export const getWorkType = async (projectId) => {
  const response = await requestJira(
    `/rest/api/3/issuetype/project?projectId=${projectId}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  return response.json();
};

// Fetch assignable users for a given project
export const getAssignableUsers = async (projectKey) => {
  if (!projectKey) return [];

  const response = await requestJira(
    `/rest/api/3/user/assignable/search?project=${projectKey}`
  );

  if (!response.ok) {
    console.error(
      `Failed to fetch assignable users for project ${projectKey}:`,
      await response.text()
    );
    return [];
  }

  return response.json();
};
