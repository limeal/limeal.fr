import './style.scss';

export const InputContainer = ({
    label,
    children,
    button
}: {
    label?: string;
    children: React.ReactNode,
    button?: {
        content?: string | React.ReactNode,
        onClick: () => void
    }
}) => {
  return (
    <div className="input-container">
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
