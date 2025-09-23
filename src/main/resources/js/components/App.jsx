import React from 'react';
import Button from '@atlaskit/button/new';
import { useState, useEffect } from 'react';
import Select from "@atlaskit/select";
import Avatar from "@atlaskit/avatar";
import "../../css/App.css";
import ApiUtils from "../../helper/ApiUtils";
import Spinner from '@atlaskit/spinner';

const App = () => {
    const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isOpenDelModal, setIsOpenDelModal] = useState(false);
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [updateIssueDefaultData, setUpdateIssueDefaultData] = useState(null);
  const [deleteIssueID, setDeleteIssueID] = useState(null);
  const [updateIssueID, setUpdateIssueID] = useState(null);

  const openDeleteModal = () => setIsOpenDelModal(true);
  const openUpdateModal = () => setIsOpenUpdateModal(true);
  const closeDeleteModal = () => setIsOpenDelModal(false);
  const closeUpdateModal = () => setIsOpenUpdateModal(false);

   const handleDeleteOrUpdateSuccess = () => {
    if (selectedProject) {
      fetchAllIssues(selectedProject.value);
    }
  };

  useEffect(() => {
    console.log("🚀 ~ useEffect ~ useEffect:")
    setIsLoadingProjects(true);
    ApiUtils.getProjects()
    .then((data) => {
      console.log("🚀 ~ .projects ~ data:", data)
      const projectOptions = data.map((p) => ({
        label: p.name,
        value: p.key,
        id: p.id
      }));
      setProjects(projectOptions);

      if(projectOptions.length > 0) {
        const firstProject = projectOptions[0];
        setSelectedProject(firstProject);
        fetchAllIssues(firstProject.value);
      }
    })
    .catch((error) => {
      console.error('Error fetching projects:', error);
    })
    .finally(() => {
      setIsLoadingProjects(false);
    })
  }, []);

  const fetchAllIssues = async (projectId) => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const  issues = await ApiUtils.getIssuesByProject(projectId, 0, 100, true, true);
      console.log("🚀 ~ fetchAllIssues ~ issues:", issues)
      // if (!issues) {
      //   setRows([]);
      //   return;
      // }
      // const tableTreeRows = buildTableTreeRows(issues);
      // setRows(tableTreeRows);
    } catch (err) {
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  };

  const buildTableTreeRows = (allIssues) => {
    const issueMap = new Map();
    const rootRows = [];
     allIssues.forEach((issue) => {
      const rowObject = {
        id: issue.key,
        content: [
          { id: "type", content: <img src={issue.fields.issuetype.iconUrl} alt={issue.fields.issuetype.name} style={{ height: 24 }} /> },
          { id: "key", content: issue.key },
          { id: "summary", content: issue.fields.summary },
          { id: "status", content: "status"},
          { id: "assignee", content: issue.fields.assignee ? <div style={{ display: "flex", alignItems: "center" }}><Avatar src={issue.fields.assignee.avatarUrls["24x24"]} size="small" /><span style={{ marginLeft: 8 }}>{issue.fields.assignee.displayName}</span></div> : "Unassigned" },
          { id: "action", content: <div className="action-cell"><Button className="action-btn" appearance="primary" onClick={() => { openUpdateModal(); setUpdateIssueDefaultData(issue); setUpdateIssueID(issue.id); }}>Update</Button><Button className="action-btn" appearance="danger" onClick={() => { openDeleteModal(); setDeleteIssueID(issue.id); }}>Delete</Button></div> },
        ],
        issue: issue,
        children: [],
      };
      issueMap.set(issue.key, rowObject);
    });

    allIssues.forEach((issue) => {
      const currentKey = issue.key;
      const parentKey = issue.fields.parent?.key;
      if (parentKey && issueMap.has(parentKey)) {
        const parentRow = issueMap.get(parentKey);
        const currentRow = issueMap.get(currentKey);
        parentRow.children.push(currentRow);
      } else {
        const currentRow = issueMap.get(currentKey);
        rootRows.push(currentRow);
      }
    });
    return rootRows;
  }

  return (
    <div style={{ padding: '20px' }}>
      <Select
        inputId="project-select"
        className="single-select"
        classNamePrefix="react-select"
        options={projects}
        value={selectedProject}
        // onChange={handleProjectChange}
        placeholder="Select a project"
        isLoading={isLoadingProjects}
        isDisabled={isLoadingProjects}
      />
      
      {selectedProject && (
        <div style={{ marginTop: "16px" }}>
          {isLoading ? (
            <div className="loading-container">
              <Spinner size="large"/>
              </div>
          ): (
            <>
            
            </>
          )}
    </div>

      )}
      hi son
    </div>
  );
};

export default App;
