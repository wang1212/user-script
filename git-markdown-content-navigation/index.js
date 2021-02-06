// ==UserScript==
// @name         Git Markdown Content Navigation
// @name:zh-CN   Git Markdown 文件内容导航
// @namespace    https://github.com/wang1212/user-script/blob/main/git-markdown-content-navigation
// @version      0.2.1
// @description  Provide directory navigation of the markdown file content of the github/gitee website.
// @description:zh-cn 提供 github/gitee 网站 markdown 文件内容的目录导航。
// @author       wang1212
// @match        http*://github.com/*
// @match        http*://gitee.com/*
// @grant        none
// ==/UserScript==

;(function () {
	'use strict'

	const log = console.log

	/* ------------------------------- Init ----------------------------- */

	const href = location.href

	const matchGithub = /github/
	const matchGithubRepository = /https?:\/\/github.com\/.+\/.+/
	const matchGitee = /gitee/
	const matchGiteeRepository = /https?:\/\/gitee.com\/.+\/.+/

	const isGithub = !!href.match(matchGithub)
	const isGitee = !!href.match(matchGitee)
	const isRepositoryPage = !!(href.match(matchGithubRepository) || href.match(matchGiteeRepository))

	/* ------------------------------- Parse MarkDown file content navigation ----------------------------- */

	function updateMarkdownFileContentNavigation() {
		let navBarElem = document.querySelector('.wang1212_md-content-nav')

		// Remove existing
		navBarElem && navBarElem.remove()

		if (!isRepositoryPage) return

		// titles
		const titles = getMarkDownContentTitles()
		if (!titles.length) return

		// navBar button
		navBarElem = document.createElement('div')
		navBarElem.classList.add('wang1212_md-content-nav')
		navBarElem.title = 'Markdown 文件内容导航'

		navBarElem.innerText = 'N'

		// Panel
		const navBarPanelElem = document.createElement('div')
		navBarPanelElem.classList.add('wang1212_md-content-nav_panel')

		navBarPanelElem.innerHTML = ''

		// draw titles
		titles.forEach((title) => {
			const level = +title.tagName.substr(-1)
			navBarPanelElem.innerHTML += `
<p class="wang1212_md-content-nav_to-anchor" style="font-size: ${1 - ((level - 1) * 0).toFixed(2)}rem; margin: 0; padding-left: ${((level - 1) * 0.5).toFixed(
				2
			)}rem" data-anchor="${title.anchorId}">
${title.text}
</p>
`
		})

		// --- CSS Style ---
		const styleElem = document.createElement('style')
		styleElem.type = 'text/css'
		styleElem.innerHTML = `
.wang1212_md-content-nav {
position: fixed;
right: 1rem;
bottom: 3.5rem;
z-index: 1999;
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
.wang1212_md-content-nav_to-anchor {
line-height: 1.6 !important;
}
.wang1212_md-content-nav_to-anchor:hover {
	color: rgb(0, 0, 0);
}
`

		navBarElem.appendChild(navBarPanelElem)
		document.body.appendChild(navBarElem)
		document.head.appendChild(styleElem)

		// --- Event ---
		// Show/Hide
		navBarElem.addEventListener(
			'click',
			(e) => {
				if (e.target !== navBarElem) return

				if (navBarPanelElem.style.display === 'none') {
					navBarPanelElem.style.display = 'block'
				} else {
					navBarPanelElem.style.display = 'none'
				}
			},
			false
		)

		// fly to view
		navBarPanelElem.addEventListener(
			'click',
			(e) => {
				if (!e.target.classList.contains('wang1212_md-content-nav_to-anchor')) return

				const anchorElem = document.getElementById(e.target.dataset.anchor)
				if (!anchorElem) return

				anchorElem.scrollIntoView({ behavior: 'smooth', block: 'start' })
			},
			false
		)
	}

	/* ------------------------------- To Top ----------------------------- */

	// to top button
	function updateGoToTopButton() {
		let toTopElem = document.querySelector('.wang1212_to-top')

		// Remove existing
		toTopElem && toTopElem.remove()

		// toTop button
		toTopElem = document.createElement('div')
		toTopElem.classList.add('wang1212_to-top')
		toTopElem.title = '回到顶部'

		toTopElem.innerText = '↑'

		// --- CSS Style ---
		const styleElem = document.createElement('style')
		styleElem.type = 'text/css'
		styleElem.innerHTML = `
.wang1212_to-top {
position: fixed;
right: 1rem;
bottom: 1rem;
z-index: 1999;
width: 2rem;
height: 2rem;
color: white;
font-size: 1.5rem;
line-height: 2rem;
text-align: center;
background-color: rgb(36, 41, 46);
cursor: pointer;
}
`

		document.body.appendChild(toTopElem)
		document.head.appendChild(styleElem)

		// --- Event ---
		// fly to view
		toTopElem.addEventListener(
			'click',
			() => {
				document.body.scrollIntoView({ behavior: 'smooth' })
			},
			false
		)
	}

	/* ------------------------------- Utils ----------------------------- */

	// parse titles
	function getMarkDownContentTitles() {
		let rootElem = document.querySelector('.markdown-body')

		if (!rootElem) return []

		const anchors = rootElem.querySelectorAll('a.anchor')

		if (!anchors.length) return []

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

	/* ------------------------------- Load ----------------------------- */

	function load() {
		updateMarkdownFileContentNavigation()
		updateGoToTopButton()
	}

	// Monitor page reload
	document.addEventListener('pjax:end', load, false)

	if (isGitee) {
		// Monitor page modify
		const observer = new MutationObserver(load)

		observer.observe(document.querySelector('.tree-holder'), { childList: true, subtree: false })
	}

	//
	load()
})()
