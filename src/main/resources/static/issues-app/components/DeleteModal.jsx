import React from 'react'
import ApiUtils from "../../../helper/ApiUtils";
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
import { Text } from '@atlaskit/primitives/compiled';

const DeleteModal = ({closeDeleteModal, deleteIssueID, onDeleteSuccess}) => {
  return (
    <Modal>
						<ModalHeader hasCloseButton>
							<ModalTitle>Confirm delete</ModalTitle>
						</ModalHeader>
						<ModalBody>
							<Text weight="bold">Are you sure about deleting this issue ?</Text> 
						</ModalBody>
						<ModalFooter>
							<Button appearance="subtle" onClick={closeDeleteModal}>
								Cancel
							</Button>
							<Button appearance="danger" onClick={async () =>{
                                try {
                                    await ApiUtils.deleteIssue(deleteIssueID);
                                    onDeleteSuccess();
                                } catch (error) {
                                    console.log('Có lỗi khi fetch issues');
                                }finally{
                                    closeDeleteModal();

                                }

                                }} >
								Confirm
							</Button>
						</ModalFooter>
					</Modal>
  )
}

export default DeleteModal;
     