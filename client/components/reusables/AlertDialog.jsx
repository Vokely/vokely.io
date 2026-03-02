'use client'
// components/AlertDialog.js
import useAlertStore from "@/store/alertDialogstore";


const AlertDialog = () => {
  const { isOpen, title, message, resolveCallback, closeAlert, confirmText = "Yes", cancelText = "No" } = useAlertStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (resolveCallback) resolveCallback(true); // Resolve with `true` for "Yes"
    closeAlert();
  };

  const handleCancel = () => {
    if (resolveCallback) resolveCallback(false); // Resolve with `false` for "No"
    closeAlert();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        <h2 style={{fontWeight:"bold"}}>{title}</h2>
        <p>{message}</p>
        <div style={styles.buttons}>
          <button className="bg-primary text-white" onClick={handleConfirm} style={styles.button}>
            {confirmText}
          </button>
          <button onClick={handleCancel} style={styles.button}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'start',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'end',
    gap: '10px',
    marginTop: '20px',
  },
  button: {
    padding: '5px 30px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default AlertDialog;