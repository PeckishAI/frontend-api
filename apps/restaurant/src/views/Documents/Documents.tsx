import { useTranslation } from 'react-i18next';
import { useTitle, Button } from 'shared-ui';
import DocumentCard from './Components/DocumentCard/DocumentCard';
import React, { useEffect, useState } from 'react';
import { documentService, Document } from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import DocumentDetail from '../../components/DocumentDetail/DocumentDetail';
import ImportIngredients from '../Inventory/Components/ImportIngredients/ImportIngredients';
import styles from './Documents.module.scss';

const Documents = () => {
  const { t } = useTranslation();
  useTitle(t('pages.documents'));

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const [loadingData, setLoadingData] = useState(false);
  const [document, setDocument] = useState<Document[]>([]);
  const [documentDetail, setDocumentDetail] = useState<Document | null>(null);
  const [showImportPopup, setShowImportPopup] = useState(false); // State to control ImportIngredients visibility

  function reloadDocuments() {
    if (!selectedRestaurantUUID) return;
    setLoadingData(true);
    documentService
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

  const handleDocumentClick = (clickedDocument: Document) => {
    setDocumentDetail(clickedDocument);
  };

  const handleDocumentUpdated = (updatedDocument: Document) => {
    setDocument(
      document.map((d) =>
        d.uuid === updatedDocument.uuid ? updatedDocument : d
      )
    );
    setDocumentDetail(updatedDocument);
  };

  const handleDocumentDeleted = (deletedDocument: Document) => {
    setDocument(document.filter((d) => d.uuid !== deletedDocument.uuid));
    setDocumentDetail(null);
  };

  // Upload new invoices

  // Delete invoices

  // Download invoices

  // Edit invoices

  return (
    <div className="documents">
      <div className={styles.buttonContainer}>
        <Button
          type="primary"
          value={t('document.upload')}
          className={styles.buttonTop}
          onClick={handleUploadClick} // Attach click handler
        />
        <Button
          type="primary"
          value={t('document.generate')}
          className={styles.buttonTop}
          onClick={() => {
            /* handle download here */
          }}
        />
      </div>
      <div className="cards-container">
        {document.map((doc) => {
          return (
            <DocumentCard
              key={doc.uuid}
              uuid={doc.uuid}
              supplier_name={doc.supplier_name}
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
      />
      <ImportIngredients
        openUploader={showImportPopup}
        onCloseUploader={() => setShowImportPopup(false)}
        onIngredientsImported={() => {
          /* handle imported ingredients here */
        }}
      />
    </div>
  );
};
export default Documents;
