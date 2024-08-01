import { useTranslation } from 'react-i18next';
import { useTitle, Button, Loading, Lottie } from 'shared-ui';
import DocumentCard from './Components/DocumentCard/DocumentCard';
import { useEffect, useState } from 'react';
import { Invoice, inventoryService } from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import DocumentDetail from '../../components/DocumentDetail/DocumentDetail';
import styles from './style.module.scss';
import ImportIngredients from './Components/ImportIngredients/ImportIngredients';
import { useParams } from 'react-router-dom';
import ConfirmationPopup from '../ConfirmModal/ConfirmationPopup';
import toast from 'react-hot-toast';

const Documents = () => {
  const { t } = useTranslation();
  useTitle(t('pages.documents'));

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );

  const { id } = useParams();
  const [loadingData, setLoadingData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [document, setDocument] = useState<Invoice[]>([]);
  const [documentDetail, setDocumentDetail] = useState<Invoice | null>(null);
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const [show, setShow] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [actionData, setActionData] = useState<string[]>([]);

  const handleCancel = () => {
    setIsPopupVisible(false);
  };

  function reloadDocuments() {
    if (!selectedRestaurantUUID) return;
    setLoadingData(true);
    inventoryService
      .getDocument(selectedRestaurantUUID)
      .then((res) => {
        setDocument(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoadingData(false);
      });
  }

  const handleButtonClick = (doc) => {
    setActionData({ type: 'confirmDocument', data: doc });
    setIsPopupVisible(true);
  };

  const handleLogSelectedDocumentsClick = () => {
    setActionData({ type: 'logSelectedDocuments', data: selectedDocuments });
    setIsPopupVisible(true);
  };

  const toggleSelection = (doc) => {
    setSelectedDocuments((prevSelected) => {
      const isSelected = prevSelected.some(
        (selectedDoc) => selectedDoc.documentUUID === doc.documentUUID
      );
      if (isSelected) {
        return prevSelected.filter(
          (selectedDoc) => selectedDoc.documentUUID !== doc.documentUUID
        );
      } else {
        return [...prevSelected, doc];
      }
    });
  };

  const handleConfirm = async () => {
    if (!actionData) return;

    setIsPopupVisible(false);
    setLoading(true);

    try {
      let documentsToSend = [];

      if (actionData.type === 'confirmDocument') {
        const { documentUUID, supplier_uuid } = actionData.data;
        documentsToSend = [
          {
            document_uuid: documentUUID,
            supplier_uuid: supplier_uuid,
          },
        ];
      } else if (actionData.type === 'logSelectedDocuments') {
        documentsToSend = (actionData.data as Invoice[]).map((doc) => ({
          document_uuid: doc.documentUUID,
          supplier_uuid: doc.supplier_uuid,
        }));
      }

      if (documentsToSend.length > 0) {
        await inventoryService.sendInvoice(
          selectedRestaurantUUID,
          documentsToSend
        );

        if (actionData.type === 'logSelectedDocuments') {
          setSelectedDocuments([]);
        }
        reloadDocuments();
        toast.success('Invoice send to Xero Successfully!');
      }
    } catch (error) {
      console.error('API call error:', error);
    } finally {
      setLoading(false);
    }
    setIsPopupVisible(false);
  };

  useEffect(() => {
    reloadDocuments();
  }, [selectedRestaurantUUID]);

  const handleUploadClick = () => {
    setShowImportPopup(true); // Toggle visibility of the ImportIngredients component
  };

  const handleDocumentClick = (clickedDocument: Invoice) => {
    setDocumentDetail(clickedDocument);
  };

  const handleDocumentUpdated = (updatedDocument: Invoice) => {
    setDocument(
      document.map((d) =>
        d.documentUUID === updatedDocument.documentUUID ? updatedDocument : d
      )
    );
    setDocumentDetail(updatedDocument);
  };

  const handleDeleteDocument = (documentToDelete: Invoice) => {
    setDocument((prevDoc) =>
      prevDoc.filter(
        (doc) => doc.documentUUID !== documentToDelete.documentUUID
      )
    );
    setDocumentDetail(null);
  };

  useEffect(() => {
    if (id) {
      const selectedDocument = document.find((doc) => doc.documentUUID === id);
      if (selectedDocument) {
        setDocumentDetail(selectedDocument);
      }
    }
  }, [id, document]);

  const sortedDocuments = [...document].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
    const dateB = b.created_at ? new Date(b.created_at) : new Date(0);

    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className={styles.documents}>
      {loading && (
        <div className={styles.loadingContainer}>
          <Lottie type="loading" width="200px" />
        </div>
      )}
      <p className={styles.explaination}>
        Import and save your invoices so you can place orders more quickly from
        your saved documents.
      </p>
      <div className={styles.tools}>
        <Button
          type="primary"
          value={t('document.upload')}
          className={styles.uploadButton}
          onClick={handleUploadClick} // Attach click handler
        />
        <Button
          type="primary"
          value={t('document.send')}
          className={styles.uploadButton}
          onClick={handleLogSelectedDocumentsClick} // Attach click handler
          disabled={selectedDocuments.length <= 0}
        />
      </div>
      <div>
        {document.length > 0 ? (
          <div className={styles.cardsContainer}>
            {sortedDocuments.map((doc, index) => (
              <DocumentCard
                key={index}
                uuid={doc.documentUUID}
                supplier={doc.supplier}
                date={doc.date}
                image={doc.path}
                path={doc.path}
                amount={doc.amount}
                onClick={() => handleDocumentClick(doc)}
                onButtonClick={() => handleButtonClick(doc)}
                isSelected={selectedDocuments.some(
                  (selectedDoc) => selectedDoc.documentUUID === doc.documentUUID
                )}
                toggleSelection={() => toggleSelection(doc)}
                showSyncStatus={doc.sync_status}
              />
            ))}
          </div>
        ) : (
          <div className={styles.noDocuments}>There are no documents.</div>
        )}

        <DocumentDetail
          document={documentDetail}
          isOpen={documentDetail !== null}
          onRequestClose={() => setDocumentDetail(null)}
          onDocumentChanged={(document, action) => {
            if (action === 'deleted') {
              handleDeleteDocument(document);
            } else if (action === 'updated') {
              handleDocumentUpdated(document);
            }
          }}
          onDeleteDocument={() => handleDeleteDocument(documentDetail)}
          reloadDocuments={reloadDocuments}
        />
        <ConfirmationPopup
          isVisible={isPopupVisible}
          title="Confirm Action"
          message="Are you sure you want to proceed?"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
        <ImportIngredients
          openUploader={showImportPopup}
          onCloseUploader={() => setShowImportPopup(false)}
          onIngredientsImported={() => {
            // handle imported ingredients here
          }}
        />
      </div>
    </div>
  );
};
export default Documents;
