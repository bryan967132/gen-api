export const getScript = () =>
    `function openImageModal(imageSrc) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.innerHTML = \`
        <div class="image-modal-content">
            <button class="image-modal-close" aria-label="Cerrar">
                &times;
            </button>

            <img src="\${imageSrc}" alt="Captura ampliada" draggable="false">
        </div>
    \`;
    document.body.appendChild(modal);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const image = modal.querySelector('img');
    const content = modal.querySelector('.image-modal-content');
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let dragging = false;
    let startX = 0;
    let startY = 0;
    const updateTransform = () => {
        image.style.transform = \`
            translate(\${translateX}px, \${translateY}px)
            scale(\${scale})
        \`;
        image.style.cursor = scale > 1 ? 'grab' : 'zoom-in';
    };
    const resetZoom = () => {
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
    };
    const closeModal = () => {
        modal.remove();
        document.body.style.overflow = previousOverflow;
        document.removeEventListener('keydown', closeOnEscape);
    };
    const closeOnEscape = event => {
        if (event.key === 'Escape') closeModal();
    };
    content.addEventListener(
        'wheel',
        event => {
            event.preventDefault();
            const previousScale = scale;
            const factor = event.deltaY < 0 ? 1.15 : 1 / 1.15;
            scale = Math.min(Math.max(scale * factor, 1), 5);
            const rect = image.getBoundingClientRect();
            const offsetX = event.clientX - (rect.left + rect.width / 2);
            const offsetY = event.clientY - (rect.top + rect.height / 2);
            translateX -= offsetX * (scale / previousScale - 1);
            translateY -= offsetY * (scale / previousScale - 1);
            if (scale === 1) resetZoom();
            else updateTransform();
        },
        { passive: false }
    );
    image.addEventListener('pointerdown', event => {
        if (scale === 1 || event.button !== 0) return;
        event.preventDefault();
        dragging = true;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;
        image.setPointerCapture(event.pointerId);
        image.style.cursor = 'grabbing';
    });
    image.addEventListener('pointermove', event => {
        if (!dragging) return;
        translateX = event.clientX - startX;
        translateY = event.clientY - startY;
        updateTransform();
        image.style.cursor = 'grabbing';
    });
    const stopDragging = () => {
        dragging = false;
        updateTransform();
    };
    image.addEventListener('pointerup', stopDragging);
    image.addEventListener('pointercancel', stopDragging);
    image.addEventListener('lostpointercapture', stopDragging);
    image.addEventListener('dblclick', resetZoom);
    modal.querySelector('.image-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', event => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', closeOnEscape);
    updateTransform();
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
