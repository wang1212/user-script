// ==UserScript==
// @name         Github Markdown File Content Navigation
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Provide directory navigation of the markdown file content of the github website. | 提供 github 网站 markdown 文件内容的目录导航。
// @author       wang1212
// @match        http*://github.com/*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const log = console.log
    log('test')

    function init() {
        let navBarElem = document.querySelector('.wang1212_md-content-nav')

        // Remove existing
        navBarElem && navBarElem.remove()

        const rootElem = document.querySelector('.markdown-body')
        if (!rootElem) return

        // navBar button
        navBarElem = document.createElement('div')
        navBarElem.classList.add('wang1212_md-content-nav')

        navBarElem.innerText = 'N'

        // Panel
        const navBarPanelElem = document.createElement('div')
        navBarPanelElem.classList.add('wang1212_md-content-nav_panel')

        navBarPanelElem.innerHTML = ''

        // titles
        const titles = getTitles(rootElem)
        if (!titles.length) return
        log(titles)

        titles.forEach(title => {
            const level = +title.tagName.substr(-1)
            navBarPanelElem.innerHTML += `
<p class="wang1212_md-content-nav_to-anchor" style="font-size: ${1 - ((level - 1) * 0).toFixed(2)}rem; margin: 0; padding-left: ${((level - 1) * 0.5).toFixed(2)}rem" data-anchor="${title.anchorId}">
${title.text}
</p>
`
        })

        /* -----------------CSS Style------------------- */
        const styleElem = document.createElement('style')
        styleElem.type = 'text/css'
        styleElem.innerHTML = `
.wang1212_md-content-nav {
position: fixed;
right: 1rem;
bottom: 2rem;
z-index: 999;
width: 2rem;
height: 2rem;
color: white;
font-size: 1.5rem;
line-height: 2rem;
text-align: center;
background-color: rgb(36, 41, 46);
cursor: pointer;
}
.wang1212_md-content-nav_panel {
position: absolute;
right: 0;
bottom: 2rem;
display: block;
width: 20rem;
height: 75vh;
padding: 0.5rem;
overflow: auto;
color: #ddd;
text-align: left;
background: white;
box-shadow: rgba(0, 0, 0, 0.25) 0 0 0.5rem 0;
}
.wang1212_md-content-nav_to-anchor:hover {
	color: rgb(0, 0, 0);
}
`


        navBarElem.appendChild(navBarPanelElem)
        document.body.appendChild(navBarElem)
        document.head.appendChild(styleElem)

        /* -----------------Event------------------- */
        // Show/Hide
        navBarElem.addEventListener("click", (e) => {
            if (e.target !== navBarElem) return

            if (navBarPanelElem.style.display === 'none') {
                navBarPanelElem.style.display = 'block'
            } else {
                navBarPanelElem.style.display = 'none'
            }
        }, false)

        // fly to view
        navBarPanelElem.addEventListener("click", (e) => {
            if (!e.target.classList.contains('wang1212_md-content-nav_to-anchor')) return

            const anchorElem = document.getElementById(e.target.dataset.anchor)
            if (!anchorElem) return

            anchorElem.scrollIntoView({ behavior: "smooth" })
        }, false)
    }

    // parse titles
    function getTitles(rootElem) {
        const anchors = rootElem.querySelectorAll('a.anchor')

        if (!anchors.length) return

        const titles = []

        anchors.forEach((elem) => {
            const parentElem = elem.parentElement

            titles.push({
                tagName: parentElem.tagName,
                text: parentElem.textContent,
                anchorId: elem.id,
            })
        })

        return titles
    }

    document.addEventListener("pjax:end", init, false)
    init()
})();
