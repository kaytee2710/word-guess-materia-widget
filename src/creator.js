/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/main/docs/suggestions.md
 */

Namespace("Wordguess").Creator = (function () {
	const isMobile = navigator.userAgent.match(
		/(iPhone|iPod|iPad|Android|BlackBerry)/,
	)

	// Data that may be pre-established.
	let wordsToSkip = null
	let _qset = null
	let activebtn = null

	const initNewWidget = function (widget, baseUrl) {
		wordsToSkip = 3
		const manualSkippingIndices = []
		const mannualBtn = document.getElementById("mannual-button")
		const automaticBtn = document.getElementById("auto-button")
		const manualInfo = document.getElementById("manInfo")

		const dialogBox = document.getElementById("instructionalDialog")
		dialogBox.showModal()
		//let me choose on landing
		activebtn = "manual"
		mannualBtn.classList.add("selected")
		manualInfo.style.display = "block"

		Wordguess.CreatorEvents.addBtnListeners()
		Wordguess.CreatorEvents.selectedWordsLogic()
	}

	// the widget when it is saved as a draft
	const initExistingWidget = function (title, widget, qset, version, baseUrl) {
		// hide the dialog box
		const dialogBox = document.getElementById("instructionalDialog")
		const closeButton = document.getElementById("closeButton")

		closeButton.onclick = () => dialogBox.close()

		console.log(qset)

		//  get the previously selected mode
		let previousMode = "manual"
		if (qset.options && qset.options.hideMode) {
			previousMode = qset.options.hideMode
		}

		// get the passage
		let passage = []
		if (qset.options && qset.options.passage) {
			passage = qset.options.passage
		}

		// get the highlighted/hidden words ids
		let hiddenWords = []

		if (qset.items && qset.items.length > 0) {
			for (let i = 0; i < qset.items.length; i++) {
				let items = qset.items[i]

				if (items.options && items.options.wordId != null) {
					hiddenWords.push(items.options.wordId)
				}
			}
		}

		// sort the ids of the highlighted words
		hiddenWords.sort(function (a, b) {
			return a - b
		})

		// set up listeners
		Wordguess.CreatorEvents.addBtnListeners()
		Wordguess.CreatorEvents.selectedWordsLogic()

		// make the passage from individual words
		let passageText = " "
		passageText = passage
			.map(function (word) {
				return word.text
			})
			.join(" ")

		// get title
		let titleInput = document.getElementById("title")
		if (titleInput) {
			titleInput.value = title
		}

		let textArea = document.getElementById("textarea")
		if (textArea) {
			textArea.value = passageText
		}

		Wordguess.CreatorEvents.setPassage(passage)
		Wordguess.CreatorEvents.setHighlightedWords(hiddenWords)

		Wordguess.CreatorEvents.makeWordsSpans()
		Wordguess.CreatorEvents.updateWordBank()
		Wordguess.CreatorEvents.lmcProgressBar()
		Wordguess.CreatorEvents.mouseClickLogic()

		if (previousMode == "manual") {
			Wordguess.CreatorEvents.switchToLetMeChoose()
		} else {
		}

		console.log("all of this was executed")
	}

	const onSaveClicked = function (mode) {
		let widgetTitle
		if (mode == null) {
			mode = "save"
		}

		const titleValue = document.getElementById("title").value

		console.log(titleValue)
		_qset = buildSaveData()

		if (_qset === null) {
			return false
		}
		console.log(_qset)

		return Materia.CreatorCore.save(titleValue, _qset)
	}

	// build the qset data structure
	const buildSaveData = () => {
		let qset = {
			items: [],
			options: {},
		}

		const words = Wordguess.CreatorEvents.getWords()
		const highlightedWords = Wordguess.CreatorEvents.getHighlightedWords()
		const hideMode = document
			.getElementById("auto-button")
			.classList.contains("selected")

		qset.options.hideMode = hideMode === true ? "automatic" : "manual"
		qset.options.passage = words

		// QSET
		for (const id of highlightedWords) {
			let hiddenWord = words.find((w) => w.id == id)

			let question = {
				id: null,
				type: "wordguess",
				materiaType: "question",
				questions: [
					{
						text: "",
					},
				],
				answers: [
					{
						text: hiddenWord.text,
					},
				],
				options: {
					wordId: hiddenWord.id,
				},
			}
			qset.items.push(question)
		}

		qset.items = qset.items.sort((a, b) => {
			return a.options.wordId - b.options.wordId
		})

		return qset
	}

	const onSaveComplete = (title, widget, qset, version) => true

	// Public methods, called by Materia.
	return {
		initNewWidget,
		initExistingWidget,
		onSaveClicked,
		onSaveComplete,
	}
})()
