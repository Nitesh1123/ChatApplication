import { useSelector } from 'react-redux';

function Loader() {
    const loader = useSelector((state) => state.loaderReducer);
    
    if (!loader) return null;
    
    return (
        <div 
            aria-live="polite"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 9999
            }}
        >
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px'
            }}>
                {/* Modern dot spinner */}
                <div style={{
                    display: 'flex',
                    gap: '8px'
                }}>
                    <div className="dot" style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#e74c3c',
                        animation: 'dotPulse 1.4s ease-in-out infinite both'
                    }}></div>
                    <div className="dot" style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#e74c3c',
                        animation: 'dotPulse 1.4s ease-in-out infinite both',
                        animationDelay: '0.2s'
                    }}></div>
                    <div className="dot" style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#e74c3c',
                        animation: 'dotPulse 1.4s ease-in-out infinite both',
                        animationDelay: '0.4s'
                    }}></div>
                </div>
                <p style={{
                    color: 'white',
                    fontFamily: '"Poppins", sans-serif',
                    fontSize: '16px',
                    fontWeight: '500',
                    margin: 0
                }}>Loading...</p>
            </div>
        </div>
    );
}

export default Loader;