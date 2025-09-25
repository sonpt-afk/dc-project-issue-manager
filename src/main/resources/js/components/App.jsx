import React from 'react';
import Button from '@atlaskit/button/new';
import { useState, useEffect, useMemo } from 'react';
import Select from "@atlaskit/select";
import Avatar from "@atlaskit/avatar";
import "../../css/App.css";
import ApiUtils from "../../helper/ApiUtils";
import Spinner from '@atlaskit/spinner';
import TableTree, {
  Cell,
  Header,
  Headers,
  Row,
  Rows,
} from "@atlaskit/table-tree";
import Pagination from '@atlaskit/pagination';
import UpdateModal from './UpdateModal';
import DeleteModal from './DeleteModal';

const App = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [allIssues, setAllIssues] = useState([]); // Store all issues fetched
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isOpenUpdateModal, setIsOpenUpdateModal] = useState(false);
  const [updateIssueDefaultData, setUpdateIssueDefaultData] = useState(null);
  const [deleteIssueID, setDeleteIssueID] = useState(null);
  const [updateIssueID, setUpdateIssueID] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const issuesPerPage = 5; // Max 5 issues per page, including children

  const openDeleteModal = () => setIsOpenDeleteModal(true);
  const openUpdateModal = () => setIsOpenUpdateModal(true);
  const closeDeleteModal = () => setIsOpenDeleteModal(false);
  const closeUpdateModal = () => setIsOpenUpdateModal(false);

  const handleDeleteOrUpdateSuccess = () => {
    if (selectedProject) {
      fetchAllIssues(selectedProject.value);
    }
  };

  useEffect(() => {
    setIsLoadingProjects(true);
    ApiUtils.getProjects()
      .then((data) => {
        const projectOptions = data.map((p) => ({
          label: p.name,
          value: p.key,
          id: p.id
        }));
        setProjects(projectOptions);

        if (projectOptions.length > 0) {
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
      });
  }, []);

  const fetchAllIssues = async (projectId) => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const { issues } = await ApiUtils.getIssuesByProject(projectId, 0, 100, true, true);
      setAllIssues(issues || []); // Store all issues
      setCurrentPage(1); // Reset to first page on new project/fetch
    } catch (err) {
      setAllIssues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const buildTableTreeRows = (issues) => {
    const issueMap = new Map();
    const rootRows = [];

    issues.forEach((issue) => {
      const rowObject = {
        id: issue.key,
        content: [
          { id: "key", content: issue?.key },
          { id: "summary", content: issue.fields?.summary },
          { id: "status", content: issue.fields?.status?.name },
          { id: "assignee", content: issue.fields?.assignee ? <div style={{ display: "flex", alignItems: "center" }}><Avatar src={issue.fields?.assignee?.avatarUrls["24x24"]} size="small" /><span style={{ marginLeft: 8 }}>{issue.fields?.assignee?.displayName}</span></div> : "Unassigned" },
          { id: "action", content: <div className="action-cell">
            <Button className="action-btn" appearance="primary" onClick={() => {
              openUpdateModal();
              setUpdateIssueDefaultData(issue);
              setUpdateIssueID(issue.id);
            }}>Update</Button><Button className="action-btn" appearance="danger" onClick={() => { openDeleteModal(); setDeleteIssueID(issue.id); }}>Delete</Button></div> },
        ],
        issue: issue,
        children: [],
      };
      issueMap.set(issue.key, rowObject);
    });

    issues.forEach((issue) => {
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
  };

  const countTotalIssuesInRow = (row) => {
    let count = 1; // Count the parent issue itself
    if (row.children && row.children.length > 0) {
      row.children.forEach(child => {
        count += countTotalIssuesInRow(child);
      });
    }
    return count;
  };

  const paginatedRows = useMemo(() => {
    const rootRows = buildTableTreeRows(allIssues);

    const pages = [];
    let currentPageItems = [];
    let currentIssueCount = 0;

    rootRows.forEach(row => {
      const totalIssueCountForRow = countTotalIssuesInRow(row);
      if (currentIssueCount + totalIssueCountForRow <= issuesPerPage) {
        currentPageItems.push(row);
        currentIssueCount += totalIssueCountForRow;
      } else {
        pages.push(currentPageItems);
        currentPageItems = [row];
        currentIssueCount = totalIssueCountForRow;
      }
    });

    if (currentPageItems.length > 0) {
      pages.push(currentPageItems);
    }

    const totalPages = pages.length === 0 ? 1 : pages.length;
    const startIndex = currentPage - 1;
    
    return {
      paginatedItems: pages[startIndex] || [],
      totalPages: totalPages
    };
  }, [allIssues, currentPage]);

  const handlePageChange = (e, page) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Select
        inputId="project-select"
        className="single-select"
        classNamePrefix="react-select"
        options={projects}
        value={selectedProject}
        onChange={(option) => {
          setSelectedProject(option);
          fetchAllIssues(option.value);
        }}
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
          ) : (
            <>
              {paginatedRows.paginatedItems.length === 0 ? (
                <div>No issues found.</div>
              ) : (
                <div style={{ marginTop: "16px", minHeight: "400px" }}>
                  <TableTree>
                    <Headers>
                      <Header width={180}>Key</Header>
                      <Header width={300}>Summary</Header>
                      <Header width={140}>Status</Header>
                      <Header width={150}>Assignee</Header>
                      <Header width={150}>Actions</Header>
                    </Headers>
                    <Rows
                      items={paginatedRows.paginatedItems}
                      render={(row) => (
                        <Row itemId={row.id} items={row.children} hasChildren={row.children.length > 0} shouldExpandOnClick>
                          {row.content.map((cell) => (<Cell key={cell.id}>{cell.content}</Cell>))}
                        </Row>
                      )}
                    />
                  </TableTree>
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <Pagination
                      pages={Array.from({ length: paginatedRows.totalPages }, (_, i) => i + 1)}
                      max={7}
                      selectedIndex={currentPage - 1}
                      onChange={handlePageChange}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {isOpenUpdateModal ? <UpdateModal onUpdateSuccess={handleDeleteOrUpdateSuccess} selectedProject={selectedProject} updateIssueDefaultData={updateIssueDefaultData} closeUpdateModal={closeUpdateModal}/> : null}
      {isOpenDeleteModal ? <DeleteModal onDeleteSuccess={handleDeleteOrUpdateSuccess} deleteIssueID={deleteIssueID} closeDeleteModal={closeDeleteModal}/> : null}
    </div>
  );
};

export default App;
