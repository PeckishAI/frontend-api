import { ChangeEvent, useRef } from 'react';
import style from './style.module.scss';

type Props = {
  title: string;
  type: 'csv' | 'img';
  onFileUploaded: (e: File) => void;
};

const FileUploader = (props: Props) => {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (!fileInput.current || !e.target.files?.[0]) return;
    props.onFileUploaded(e.target.files?.[0]);
    e.target.value = '';
  };

  return (
    <div
      className={style.fileUploader}
      onClick={() => fileInput.current && fileInput.current.click()}>
      <input
        type="file"
        onChange={handleFileInput}
        ref={fileInput}
        style={{ display: 'none' }}
      />

      {props.type === 'csv' ? (
        <i className={`fa-solid fa-file-csv ${style.iconType}`}></i>
      ) : props.type === 'img' ? (
        <i className={`fa-solid fa-file-image ${style.iconType}`}></i>
      ) : null}

      <div className={style.select}>
        <i className={`fa-solid fa-plus ${style.addIcon}`}></i>
        <p className={style.title}>{props.title}</p>
      </div>

      <p className={style.fileType}>
        {props.type === 'csv' ? '.csv' : '.jpg .png'}
      </p>
    </div>
  );
};

export default FileUploader;
