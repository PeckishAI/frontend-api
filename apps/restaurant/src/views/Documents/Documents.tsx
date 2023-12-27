import { useTranslation } from 'react-i18next';
import { useTitle, Button } from 'shared-ui';
import DocumentCard from './Components/DocumentCard/DocumentCard';
import React, { useEffect, useState } from 'react';
import { Invoice, inventoryService } from '../../services';
import { useRestaurantStore } from '../../store/useRestaurantStore';
import DocumentDetail from '../../components/DocumentDetail/DocumentDetail';
import ImportIngredients from '../Inventory/Components/ImportIngredients/ImportIngredients';
import styles from './style.module.scss';

const Documents = () => {
  const { t } = useTranslation();
  useTitle(t('pages.documents'));

  const selectedRestaurantUUID = useRestaurantStore(
    (state) => state.selectedRestaurantUUID
  );
  const [loadingData, setLoadingData] = useState(false);
  const [document, setDocument] = useState<Invoice[]>([]);
  const [documentDetail, setDocumentDetail] = useState<Invoice | null>(null);
  const [showImportPopup, setShowImportPopup] = useState(false);

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
    console.log('clicked');
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

  const handleDocumentDeleted = (deletedDocument: Invoice) => {
    setDocument(
      document.filter((d) => d.documentUUID !== deletedDocument.documentUUID)
    );
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
          className={styles.uploadButton}
          onClick={handleUploadClick} // Attach click handler
        />
        <Button
          type="primary"
          value={t('document.upload')}
          className={styles.orderButton}
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
