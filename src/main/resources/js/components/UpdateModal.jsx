import React from 'react'
import { useState, useEffect } from 'react';
import ApiUtils from "../../helper/ApiUtils";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@atlaskit/modal-dialog";
import Form, { Field, HelperMessage } from "@atlaskit/form";
import Textfield from "@atlaskit/textfield";
import Select from "@atlaskit/select";
import Button from '@atlaskit/button/new';
const UpdateModal = ({selectedProject, updateIssueDefaultData ,onUpdateSuccess, closeUpdateModal}) => {
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [availableTransitions, setAvailableTransitions] = useState([]);
  const [isLoadingTransitions, setIsLoadingTransitions] = useState(true);
  const [selectedTransitionId, setSelectedTransitionId] = useState(null);

  console.log('updateIssueDefaultData',updateIssueDefaultData)

  useEffect(() => {
    const fetchAssignableUsers = async () => {
      console.log("🚀 ~ fetchAssignableUsers ~ selectedProject:", selectedProject)
      if(selectedProject){
        setIsLoadingUsers(true);
        try {
          const usersList = await ApiUtils.getAssignableUser(selectedProject.value);
          console.log("Fetched users:", usersList);
           const userOptions = usersList.map((user) => ({
            label: user.displayName,
            value: user.key,
            avatar: user.avatarUrls["24x24"],
          }));
          userOptions.unshift({
            label: "Unassigned",
            value: "unassigned",
          });
          setAssignableUsers(userOptions);

        } catch (error) {
          console.error("Failed to load assignable users:", error);
          
        }finally {
          setIsLoadingUsers(false);
        }
      }
    }
    fetchAssignableUsers();
  }, [selectedProject]); // Dependency on selectedProject

  useEffect(() => {
    const fetchTransitions = async () => {
      if (updateIssueDefaultData?.id) {
        setIsLoadingTransitions(true);
        try {
          const transitionsData = await ApiUtils.getTransitions(updateIssueDefaultData.id);
          console.log("Fetched transitions:", transitionsData);
          const transitionOptions = transitionsData.transitions.map((t) => ({
            label: t?.to?.name,
            value: t?.to?.name,
            id: t.id,
          }));
          setAvailableTransitions(transitionOptions);
          console.log("🚀 ~ fetchTransitions ~ transitionOptions:", transitionOptions)
        } catch (error) {
          console.error("Failed to load transitions:", error);
        } finally {
          setIsLoadingTransitions(false);
        }
      }
    };
    fetchTransitions();
  }, [updateIssueDefaultData?.id]); // Dependency on issue ID

  const handleFormSubmit = async (formData) => {
    console.log("Form data received:", formData);

    // Build the payload with fields that are always sent
    const fieldsToUpdate = {
      summary: formData.summary,
      assignee: {
        name: formData.assignee === "unassigned" ? null : formData.assignee,
      },
    };

    try {
      // First, handle the transition if one is selected
      if (selectedTransitionId) {
        const transitionPayload = {
          transition: {
            id: selectedTransitionId,
          },
        };
        await ApiUtils.transitionIssue(updateIssueDefaultData.id, transitionPayload);
        console.log("Issue transitioned successfully!");
      }

      // Then, update other fields separately
      // Check if there are actual fields to update (summary or assignee)
      const hasFieldsToUpdate = fieldsToUpdate.summary !== updateIssueDefaultData?.fields?.summary ||
                                (fieldsToUpdate.assignee?.name !== (updateIssueDefaultData?.fields?.assignee?.name || "unassigned") && fieldsToUpdate.assignee?.name !== null);

      if (hasFieldsToUpdate) {
        await ApiUtils.updateIssue(updateIssueDefaultData.id, { fields: fieldsToUpdate });
        console.log("Issue fields updated successfully!");
      } else if (!selectedTransitionId) {
        console.log("No fields to update and no transition selected.");
      }

      onUpdateSuccess();
    } catch (error) {
      console.error("Failed to update/transition issue:", error);
    } finally {
      closeUpdateModal();
    }
  };

  
  return (
    <Modal
      onClose={closeUpdateModal}
      className="update-issue-modal"
    >
      <Form onSubmit={handleFormSubmit}
      className="update-issue-form"
      >
        {({ formProps }) => (
          <form {...formProps} id="modal-form" style={{ height: isSelectOpen ? '90vh' : 'auto' }}> 
            <ModalHeader hasCloseButton>
              <ModalTitle>Update issue </ModalTitle>
            </ModalHeader>
            <ModalBody>
              
              <Field
                id="summary"
                name="summary"
                label="Summary"
                defaultValue={updateIssueDefaultData?.fields?.summary}
              >
                {({ fieldProps }) => <Textfield {...fieldProps} />}
              </Field>
              <Field id='transition' name="transition" label="Change Status" >
                {({ fieldProps }) => (
                  <Select
                    {...fieldProps}
                    isLoading={isLoadingTransitions}
                    placeholder="Choose a transition..."
                    options={updateIssueDefaultData?.fields?.status?.name === "To Do" ?  (availableTransitions.filter(t => t?.label === "In Progress")) : updateIssueDefaultData?.fields?.status?.name === "In Progress"
      ? availableTransitions.filter(t => t?.label === "Done")
      : availableTransitions}
                    onFocus={() => {
                      setIsSelectOpen(true);
                      console.log("Transition Select focused (menu opened)");
                    }}
                    onBlur={() => {
                      setIsSelectOpen(false);
                      console.log("Transition Select blurred (menu closed)");
                    }}
                    onChange={(selectedOption) => {
                      console.log("🚀 ~ selectedOption:", selectedOption)
                      setSelectedTransitionId(selectedOption?.id);
                      fieldProps.onChange(selectedOption?.value); 
                    }}
                    value={availableTransitions.find(
                      (opt) => opt.value === selectedTransitionId
                    )}
                  />
                )}
              </Field>

              <Field
                id="assignee"
                name="assignee"
                label="Assignee"
                defaultValue={
                  updateIssueDefaultData?.fields?.assignee?.name ||
                  "unassigned"
                }
              >
                {({ fieldProps }) => (
                  <Select
                    {...fieldProps}
                    isLoading={isLoadingUsers}
                    placeholder="Select assignee..."
                    options={assignableUsers}
                    onFocus={() => {
                      setIsSelectOpen(true);
                    }}
                    onBlur={() => {
                      setIsSelectOpen(false);
                    }}
                    onChange={(option) => {
                      fieldProps.onChange(option?.label);
                    }}
                    value={assignableUsers.find(
                      (opt) => opt.value === fieldProps.value
                    )}
                    formatOptionLabel={(option) => (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {option.avatar ? (
                          <img
                            src={option.avatar}
                            alt={option.label}
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              marginRight: 8,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              marginRight: 8,
                              backgroundColor: "#dfe1e6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <span style={{ fontSize: 12 }}>?</span>
                          </div>
                        )}
                        <span>{option.label}</span>
                      </div>
                    )}
                  />
                )}
              </Field>
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={closeUpdateModal}>
                Cancel
              </Button>
              <Button type="submit" form="modal-form" appearance="primary">
                Update
              </Button>
            </ModalFooter>
          </form>
        )}
      </Form>
    </Modal>
  )
}

export default UpdateModal
