const RetroButton = ({ children, onClick, style }) => (
    <button className="retro-btn-style" onClick={onClick} style={style}>
        {children}
    </button>
);

export default RetroButton;