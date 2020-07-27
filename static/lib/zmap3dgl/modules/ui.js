


const panel = document.createElement('div');
panel.style.position = 'absolute';
panel.style.top = '10vh';
panel.style.left = '0';
document.body.appendChild(panel);

function defineButtons(btns,title) {

    const btng = document.createElement('div');
    btng.className = "btn-group btn-group-sm";
    btng.role = "group";
    btng.style.marginBottom = "8px";

    const btn = document.createElement('button');
    btn.type = "button";
    btn.className = "btn btn-info";
    btng.appendChild(btn);
    btn.textContent = title;

    const icon = document.createElement('span');
    icon.className = 'glyphicon glyphicon-chevron-right';
    btn.appendChild(icon);

    for (let opt of btns) {
        const btn = document.createElement('input');
        btn.style.display = 'none';
        btn.type = "button";
        btn.className = "btn btn-info";
        btn.onclick = opt.onclick;
        btn.value = opt.text;
        btng.appendChild(btn);
    }
    panel.appendChild(btng);
    panel.appendChild(document.createElement('br'));

    let flag = false;
    btn.onclick = e => {
        flag = !flag;
        btng.childNodes.forEach(e => {
            if (e === btn) return;
            e.style.display = flag ? 'block' : 'none';
        });
    };
}

export { defineButtons };