export default class {
    constructor(opts = {}) {
        const { delay, height, width, left, top, bottom, right } = opts;

        this.delay = delay ? delay : 500;

        this.panel = document.createElement('div');
        this.panel.className = 'scrollpanel';

        this.panel.style.width = width;
        this.panel.style.height = height;
        this.panel.style.left = left;
        this.panel.style.top = top;
        this.panel.style.bottom = bottom;
        this.panel.style.right = right;

        this.content = document.createElement('ul');
        this.content.className = 'content';
        this.contentcp = document.createElement('ul');
        this.contentcp.className = 'contentcopy';
        this.panel.appendChild(this.content);
        this.panel.appendChild(this.contentcp);

        this.contentcp.innerHTML = this.content.innerHTML;
        document.body.appendChild(this.panel);

        this.content.addEventListener('DOMSubtreeModified', e => {
            this.update();
        });
    }

    startScroll() {
        this.timer = window.setInterval(this.scroll, this.delay, this);
    }

    stop() {
        window.clearTimeout(this.timer);
    }


    scroll(that) {
        const { panel, content, contentcp } = that;
        if ((contentcp.offsetTop - content.offsetTop) < panel.scrollTop)
            panel.scrollTop = 0;
        else {
            panel.scrollTop++;
        }
    }

    add(txt) {
        const { content } = this;
        const p = document.createElement('li');
        p.innerText = txt;
        content.appendChild(p);
        this.update();
    }

    update() {
        this.contentcp.innerHTML = this.content.innerHTML;
    }

    clear() {
        this.stop();
        document.body.removeChild(this.panel);
    }

}