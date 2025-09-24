import axios from 'axios';

const BASE_URL = AJS.contextPath();
const API_PATH = '/rest/api/2';

export const apiCall = async (url, method = 'GET', data = null) => {
    try {
        let response;
        const axiosConfig = {
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            headers: {}
        };

        switch (method) {
            case 'GET':
                response = await axios.get(BASE_URL + url, axiosConfig);
                break;
            case 'POST':
                axiosConfig.headers['Content-Type'] = 'application/json';
                response = await axios.post(BASE_URL + url, JSON.stringify(data), axiosConfig);
                break;
            case 'PUT':
                response = await axios.put(BASE_URL + url, data, axiosConfig);
                break;
            case 'DELETE':
                await axios.delete(BASE_URL + url, axiosConfig);
                return;
            default:
                throw new Error(`Unsupported method: ${method}`);
        }

        return response.data;
    } catch (error) {
        console.error('Error during the API call', error);
        throw error;
    }
};

class ApiUtils {
    static getProjects = async() =>{
        return await apiCall(`${API_PATH}/project`);
    }
    static getIssuesByProject = async(  projectKey,
        startAt = 0,
        maxResults = 10,
        includeParent = false,
        fetchAllPages = false) =>{
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
            const result = await apiCall(
              `${API_PATH}/search?jql=${encodeURIComponent(jql)}&startAt=${startAt}&maxResults=${maxResults}&fields=${fields}`
            );
            // result là object JSON (axios data)
            return {
              issues: result?.issues ?? [],
              total: result?.total ?? 0
            };
          } else {
            // New behavior - fetch all pages
            let allIssues = [];
            let currentStartAt = startAt;
            let hasMore = true;
            let total = 0;
        
            try {
              while (hasMore) {
                const result = await apiCall(
                  `${API_PATH}/search?jql=${encodeURIComponent(jql)}&startAt=${currentStartAt}&maxResults=${maxResults}&fields=${fields}`
                );
        
                const pageIssues = result?.issues ?? [];
                if (pageIssues.length === 0) break;
        
                allIssues = allIssues.concat(pageIssues);
                total = result?.total ?? allIssues.length;
        
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
    
    // Sửa updateIssue:
static updateIssue = async (issueId, updateData) => {
	const result = await apiCall(`${API_PATH}/issue/${issueId}`, 'PUT', updateData);
	return result; // axios data (thường rỗng với 204)
}

static getTransitions = async (issueId) => {
  return await apiCall(`${API_PATH}/issue/${issueId}/transitions`);
}

static transitionIssue = async (issueId, transitionData) => {
  const result = await apiCall(`${API_PATH}/issue/${issueId}/transitions`, 'POST', transitionData);
  return result;
}

    // Sửa deleteIssue:
static deleteIssue = async (issueId) => {
	await apiCall(`${API_PATH}/issue/${issueId}`, 'DELETE');
	return true;
};
      
    // Sửa getListIssueType:
static getListIssueType = async () => {
	return await apiCall(`${API_PATH}/issuetype`, 'GET');
}

    // Sửa getAssignableUser:
static getAssignableUser = async (projectKey) => {
	if (!projectKey) return [];
	return await apiCall(`${API_PATH}/user/assignable/multiProjectSearch?projectKeys=${projectKey}`);
};

static getIssuesStatus= async () => {

  const response = await apiCall(
    `${API_PATH}/status`
  );
  
  console.log("🚀 ~ ApiUtils ~ response:", response)
  
  return response || [];
}
}

export default ApiUtils
