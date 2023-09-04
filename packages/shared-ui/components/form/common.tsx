import styles from './common.module.scss';

type ErrorMessageProps = {
  text: string;
};

export const ErrorMessage = (props: ErrorMessageProps) => {
  return <p className={styles.errorMessage}>{props.text}</p>;
};

type FloatingLabelProps = {
  text: string;
};

// TODO: Create generic floating label (to use on LabeledInput, PhoneNumberInput, etc.)
// Use the existing from LabeledInput
export const FloatingLabel = (props: FloatingLabelProps) => {
  return <p className="error-message">{props.text}</p>;
};
