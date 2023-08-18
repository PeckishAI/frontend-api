import './style.scss';
import { Input } from 'shared-ui';
import Fuse from 'fuse.js';
import { useRef, useState } from 'react';

type Props<T> = {
  placeholder?: string;
  width?: string;
  fuseOptions?: Fuse.IFuseOptions<T>;
  itemList: ReadonlyArray<T>;
  extractKey: keyof T;
  value: string;
  onChange: (value: string) => void;
  onSelectItem?: (item: T) => void;
};

const FuseInput = <T extends object>(props: Props<T>) => {
  // const [inputValue, setInputValue] = useState('');
  const [fuseList, setFuseList] = useState<Fuse.FuseResult<T>[]>();
  const [fuseListVisible, setFuseListVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = new Fuse(props.itemList, props.fuseOptions);

  const handleOnChangeValue = (value: string) => {
    props.onChange(value);
    if (!fuseListVisible) {
      setFuseListVisible(true);
    }
    setFuseList(fuse.search(value));
  };

  const handleOnSuggestedItemClick = (value: T) => {
    console.log('selected ingredint : ', value);

    props.onChange(value[props.extractKey]);
    props.onSelectItem && props.onSelectItem(value);

    setFuseListVisible(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  return (
    <div className="fuse-input">
      <Input
        type="text"
        onChange={(value) => handleOnChangeValue(value)}
        value={props.value}
        placeholder={props.placeholder}
        width={props.width}
        ref={inputRef}
      />
      {props.value && fuseListVisible && (
        <div className="list">
          <ul>
            {fuseList?.map((el, i) => (
              <li
                key={i}
                onClick={() => {
                  handleOnSuggestedItemClick(el.item);
                }}>
                {el.item[props.extractKey]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FuseInput;
