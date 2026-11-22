export const getScript = () =>
    `function openImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = \`
        <div class="image-modal-content">
            <button
                class="image-modal-close"
                aria-label="Cerrar"
            >&times;</button>
            <img src="\${imageSrc}" alt="Captura ampliada">
        </div>
    \`;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = event => {
        if (event.key === 'Escape') {
            closeModal();
        }
    };
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = previousOverflow;
        document.removeEventListener('keydown', closeOnEscape);
    };
    document.body.style.overflow = 'hidden';
    document.body.appendChild(modal);
    modal.querySelector('.image-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', event => {
        if (event.target === modal) {
            closeModal();
        }
    });
    document.addEventListener('keydown', closeOnEscape);
}
/* Navegación entre vistas */
const navigationButtons = document.querySelectorAll('.nav-button');
const views = document.querySelectorAll('.view');
navigationButtons.forEach(button => {
    button.addEventListener('click', () => {
        navigationButtons.forEach(item => item.classList.remove('active'));
        button.classList.add('active');
        views.forEach(view => {
            view.hidden = view.id !== button.dataset.view;
        });
        document.getElementById('sidebar-tests').hidden = button.dataset.view !== 'tests';
    });
});
/* Navegación entre tests */
const testButtons = document.querySelectorAll('.test-button');
const testPanels = document.querySelectorAll('.test-panel');
testButtons.forEach(button => {
    button.addEventListener('click', () => {
        testButtons.forEach(item => item.classList.remove('selected'));
        button.classList.add('selected');
        testPanels.forEach(panel => {
            panel.hidden = panel.id !== 'test-' + button.dataset.test;
        });
    });
});
`;
