import PhoneInputForm, {
  Props as FormProps,
} from 'react-phone-number-input/react-hook-form';
import PhoneInput, { Props } from 'react-phone-number-input';
import './PhoneNumberInput.scss';
import 'react-phone-number-input/style.css';
import { FieldValues } from 'react-hook-form';
import { ErrorMessage } from '../common';

// To fix unknown extend
type Extend = NonNullable<unknown>;

type PhoneNumberInputProps<FV extends FieldValues> = {
  mode?: 'input' | 'form';
  error?: string;
} & (FV extends undefined ? Props<Extend> : FormProps<Extend, FV>);

const PhoneNumberInput = <FV extends FieldValues>(
  props: PhoneNumberInputProps<FV>
) => {
  const { mode, error, ...rest } = props;

  let phoneInput;
  if (mode === 'form') {
    phoneInput = (
      <PhoneInputForm {...(rest as unknown as FormProps<Extend, FV>)} />
    );
  } else {
    phoneInput = <PhoneInput {...(rest as unknown as Props<Extend>)} />;
  }

  return (
    <div>
      {phoneInput}
      {error && <ErrorMessage text={error} />}
    </div>
  );
};
export default PhoneNumberInput;
