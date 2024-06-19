import { useTranslation } from 'react-i18next';
import { useTitle, Button } from 'shared-ui';
import DocumentCard from './Components/DocumentCard/DocumentCard';
import { useEffect, useState } from 'react';
import { Invoice, inventoryService } from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import DocumentDetail from '../../components/DocumentDetail/DocumentDetail';
import styles from './style.module.scss';
import ImportIngredients from './Components/ImportIngredients/ImportIngredients';
import { useLocation, useParams } from 'react-router-dom';

const Documents = () => {
  const { t } = useTranslation();
  useTitle(t('pages.documents'));

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const location = useLocation();
  const { id } = useParams();
  console.log('id', id);
  const [loadingData, setLoadingData] = useState(false);
  const [document, setDocument] = useState<Invoice[]>([]);
  const [documentDetail, setDocumentDetail] = useState<Invoice | null>(null);
  const [showImportPopup, setShowImportPopup] = useState(false);

  console.log('documentDetail', document);

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

  // Upload new invoices

  // Delete invoices

  // Download invoices

  // Edit invoices

  return (
    <div className={styles.documents}>
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
      </div>
      <div className={styles.cardsContainer}>
        {document.map((doc, index) => {
          return (
            <DocumentCard
              key={index}
              uuid={doc.documentUUID}
              supplier={doc.supplier}
              date={doc.date}
              image={doc.path}
              path={doc.path}
              amount={doc.amount}
              onClick={() => {
                handleDocumentClick(doc);
              }}
            />
          );
        })}
      </div>
      <DocumentDetail
        document={documentDetail}
        isOpen={documentDetail !== null}
        onRequestClose={() => setDocumentDetail(null)}
        onDocumentChanged={(document, action) => {
          if (action === 'deleted') {
            handleDocumentDeleted(document);
          } else if (action === 'updated') {
            handleDocumentUpdated(document);
          }
        }}
        onDeleteDocument={() => handleDeleteDocument(documentDetail)}
      />
      <ImportIngredients
        openUploader={showImportPopup}
        onCloseUploader={() => setShowImportPopup(false)}
        onIngredientsImported={() => {
          // handle imported ingredients here
        }}
      />
    </div>
  );
};
export default Documents;
