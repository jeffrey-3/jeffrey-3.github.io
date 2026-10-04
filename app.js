function captureVideoFrame(video) {
    return new Promise(resolve => {
        const draw = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                canvas.getContext('2d').drawImage(video, 0, 0);
                resolve(canvas.toDataURL('image/jpeg'));
            } catch (e) {
                resolve(null);
            }
        };
        const onReady = () => {
            if (!video.videoWidth) return resolve(null);
            if (video.duration > 0.2) {
                let done = false;
                video.addEventListener('seeked', () => { if (!done) { done = true; draw(); } });
                setTimeout(() => { if (!done) { done = true; draw(); } }, 1500);
                try { video.currentTime = 0.1; } catch (e) { draw(); }
            } else {
                draw();
            }
        };
        if (video.readyState >= 2) onReady();
        else video.addEventListener('loadeddata', onReady, { once: true });
    });
}

document.querySelectorAll('.media-grid > img, .media-grid > video').forEach(el => {
    const wrapper = document.createElement('div');
    wrapper.className = 'media-item';
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    if (el.tagName === 'IMG') {
        wrapper.style.backgroundImage = 'url("' + el.src + '")';
    } else {
        captureVideoFrame(el).then(dataUrl => {
            if (dataUrl) wrapper.style.backgroundImage = 'url("' + dataUrl + '")';
        });
    }
});

document.querySelectorAll('.intro-images figure').forEach(figure => {
    const img = figure.querySelector('img');
    if (img) figure.style.backgroundImage = 'url("' + img.src + '")';
});

const lightbox = document.createElement('div');
lightbox.className = 'lightbox';
document.body.appendChild(lightbox);

const closeBtn = document.createElement('span');
closeBtn.className = 'lightbox-close';
closeBtn.textContent = '\u2715';
lightbox.appendChild(closeBtn);

const content = document.createElement('div');
content.className = 'lightbox-content';
lightbox.appendChild(content);

let origVideoParent = null;
let origVideoNext = null;
function restoreVideo() {
    const v = content.querySelector('video');
    if (v && origVideoParent) {
        v.style.cursor = 'zoom-in';
        if (origVideoNext) origVideoParent.insertBefore(v, origVideoNext);
        else origVideoParent.appendChild(v);
    }
    origVideoParent = null;
    origVideoNext = null;
}
function closeLightbox() {
    lightbox.classList.remove('active');
    restoreVideo();
}

lightbox.addEventListener('click', e => {
    if (e.target.tagName !== 'IMG' && e.target.tagName !== 'VIDEO') closeLightbox();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
});

const hamburger = document.querySelector('.hamburger');
const navRight = document.querySelector('.nav-right');
hamburger.addEventListener('click', () => {
    navRight.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.textContent = navRight.classList.contains('open') ? '\u2715' : '\u2630';
});
document.querySelectorAll('nav a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        const id = a.getAttribute('href').substring(1);
        const target = document.getElementById(id);
        if (target) {
            e.preventDefault();
            navRight.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.textContent = '\u2630';
            const header = document.querySelector('header');
            const offset = header ? header.offsetHeight : 0;
            const pos = target.getBoundingClientRect().top + window.scrollY - offset - 10;
            window.scrollTo({ top: pos, behavior: 'smooth' });
        }
    });
});

document.querySelectorAll('.media-grid img, .media-grid video').forEach(el => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', e => {
        e.stopPropagation();
        if (el.tagName === 'IMG') {
            content.innerHTML = '';
            const img = document.createElement('img');
            img.src = el.src;
            content.appendChild(img);
        } else {
            restoreVideo();
            content.innerHTML = '';
            origVideoParent = el.parentNode;
            origVideoNext = el.nextSibling;
            el.style.cursor = 'default';
            content.appendChild(el);
        }
        lightbox.classList.add('active');
    });
});
