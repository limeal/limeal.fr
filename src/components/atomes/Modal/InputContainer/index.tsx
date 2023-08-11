import './style.scss';

export const InputContainer = ({
    label,
    children,
    button,
    style
}: {
    label?: string;
    children: React.ReactNode,
    button?: {
        content?: string | React.ReactNode,
        onClick: () => void
    }
    style?: React.CSSProperties
}) => {
  return (
    <div className="input-container" style={style}>
      {label && <label htmlFor={label.toLowerCase()}>{label}</label>}
      {button ? (
        <div className='input-container--sub'>
            {children}
            <button type="button" onClick={button.onClick}>{button.content}</button>
        </div>
      ) : (
        children
      )}
    </div>
  );
};
