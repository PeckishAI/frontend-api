import PhoneInputForm, {
  Props as FormProps,
} from 'react-phone-number-input/react-hook-form';
import PhoneInput, { Props } from 'react-phone-number-input';
import './PhoneNumberInput.scss';
import 'react-phone-number-input/style.css';
import { FieldValues } from 'react-hook-form';

type PhoneNumberInputProps<FV extends FieldValues> = {
  mode?: 'input' | 'form';
} & (FV extends undefined ? Props<{}> : FormProps<{}, FV>);

const PhoneNumberInput = <FV extends FieldValues>(
  props: PhoneNumberInputProps<FV>
) => {
  const { mode, ...rest } = props;

  if (mode === 'form') {
    return <PhoneInputForm {...(rest as FormProps<{}, FV>)} />;
  } else {
    return <PhoneInput {...(rest as unknown as Props<{}>)} />;
  }
};
export default PhoneNumberInput;
