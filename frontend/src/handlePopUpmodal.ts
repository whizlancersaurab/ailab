 export const handleModalPopUp = (elemId: string) => {
    const modalElement = document.getElementById(elemId);
    if (modalElement) {
      const modalInstance = window.bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }
  }