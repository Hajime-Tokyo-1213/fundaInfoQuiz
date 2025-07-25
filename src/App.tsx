import { useEffect, useState, useRef } from 'react'
import useQuizStore from './store/quizStore'
import ChoiceList from './components/ChoiceList'
import ExplanationPanel from './components/ExplanationPanel'
import { useKeyboardNav } from './hooks/useKeyboardNav'
import { useSwipeNav } from './hooks/useSwipeNav'
import ResultScreen from './components/ResultScreen'
import type { Chapter } from './types/quiz'

function ChapterSelection({ chapters, onSelectChapter }: { chapters: Chapter[]; onSelectChapter: (id: string) => void }) {
  return (
    <div className="chapter-selection">
      <h1 className="chapter-title">章を選択してください</h1>
      <div className="chapter-list">
        {chapters.map((chapter) => (
          <button key={chapter.id} onClick={() => onSelectChapter(chapter.id)} className="chapter-button">
            {chapter.title}
          </button>
        ))}
      </div>
    </div>
  )
}

function App() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  // キーボードナビゲーションを有効にする
  useKeyboardNav()
  // スワイプナビゲーションを有効にする
  // ここではまだquizCardRefを渡す（次のステップでquizContentWrapperRefにする）
  useSwipeNav() 

  const [cardHeight, setCardHeight] = useState<number | 'auto'>('auto')
  const questionViewRef = useRef<HTMLDivElement>(null)
  const explanationViewRef = useRef<HTMLDivElement>(null)

  // ストアから必要な状態とアクションを個別に取得する
  const {
    chapters,
    questions,
    currentQuestionIndex,
    isAnswerShown,
    score,
    isQuizFinished,
    isQuizStarted,
    loadChapters,
    selectChapter,
    reset,
    backToChapterSelection,
  } = useQuizStore()

  const loadGlossary = useQuizStore((state) => state.loadGlossary);

  // コンポーネントがマウントされた時に一度だけ問題データを読み込む
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const [chaptersResponse, glossaryResponse] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}data/questions.json`),
          fetch(`${import.meta.env.BASE_URL}data/words.json`), 
        ]);

        if (!chaptersResponse.ok || !glossaryResponse.ok) {
          throw new Error('ネットワークの応答がありませんでした');
        }

        const chaptersData = await chaptersResponse.json();
        const glossaryData = await glossaryResponse.json();

        loadChapters(chaptersData.chapters);
        loadGlossary(glossaryData);
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      }
    };

    fetchQuizData();
  }, [loadChapters, loadGlossary]);

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  useEffect(() => {
    if (!isQuizStarted) {
      setCardHeight('auto');
      return;
    }
    const timer = setTimeout(() => {
      const questionHeight = questionViewRef.current?.offsetHeight ?? 0
      const explanationHeight = explanationViewRef.current?.offsetHeight ?? 0
      if (questionHeight > 0 && explanationHeight > 0) {
        setCardHeight(Math.max(questionHeight, explanationHeight))
      }
    }, 50) // DOMの更新を待つための短い遅延

    return () => clearTimeout(timer)
  }, [currentQuestion, isQuizStarted])

  const handleQuestionJump = (index: number) => {
    // Set the current question index to the selected index
    useQuizStore.setState({ currentQuestionIndex: index });
  };

  return (
    <div className="container">
      {/* Page Number Jump Buttons */}
      <div className="page-jump-buttons">
        {/* ここに「トップページに戻る」ボタンを追加します */}
        {isQuizStarted && (
          <button onClick={backToChapterSelection} className="back-to-home-button">
            トップページに戻る
          </button>
        )}
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => handleQuestionJump(index)}
            className={`page-jump-button ${currentQuestionIndex === index ? 'active' : ''}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
      {/* Hidden calculators for height measurement */}
      <div style={{ visibility: 'hidden', position: 'absolute', zIndex: -1, width: '100%', maxWidth: '900px' }}>
        {currentQuestion && (
          <>
            {/* Question View Calculator */}
            {/* ここでも新しい構造を反映させることで、計算が正確になります */}
            <div className="quiz-card" ref={questionViewRef}>
                <div className="quiz-content-wrapper">
                    <div className="question-section">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="question-number">
                            問題 {currentQuestionIndex + 1} / {questions.length}
                        </div>
                        <div className="question" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace' }} dangerouslySetInnerHTML={{ __html: currentQuestion.body }}>
                        </div>
                        {currentQuestion.imageUrl && (
                            <div className="question-image-container">
                                <img src={currentQuestion.imageUrl} alt="問題の図" className="question-image" />
                            </div>
                        )}
                        <div className="choices">
                            <ChoiceList
                                choices={currentQuestion.choices}
                                correctChoiceIndex={currentQuestion.correctChoiceIndex}
                                isAnswerShown={false}
                            />
                        </div>
                    </div> {/* .question-section 終了 */}
                </div> {/* .quiz-content-wrapper 終了 */}
                <div className="navigation-hint">
                    {isTouchDevice ? (
                        <>
                            <span className="key-icon">←</span>
                            <span>スワイプ</span>
                            <span className="key-icon">→</span>
                        </>
                    ) : (
                        <>
                            <span className="key-icon">→</span>
                            <span>キーを押して解答を表示</span>
                        </>
                    )}
                </div>
            </div>

            {/* Explanation View Calculator */}
            {/* ここでも新しい構造を反映させることで、計算が正確になります */}
            <div className="quiz-card" ref={explanationViewRef} style={{ marginTop: '20px' }}>
                <div className="quiz-content-wrapper">
                    <div className="question-section">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="question-number">
                            問題 {currentQuestionIndex + 1} / {questions.length}
                        </div>
                        <div className="question" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace' }} dangerouslySetInnerHTML={{ __html: currentQuestion.body }}>
                        </div>
                        {currentQuestion.imageUrl && (
                            <div className="question-image-container">
                                <img src={currentQuestion.imageUrl} alt="問題の図" className="question-image" />
                            </div>
                        )}
                        <ExplanationPanel
                            choices={currentQuestion.choices}
                            correctChoiceIndex={currentQuestion.correctChoiceIndex}
                            isAnswerShown={true}
                            question={currentQuestion}
                        />
                    </div> {/* .question-section 終了 */}
                </div> {/* .quiz-content-wrapper 終了 */}
                <div className="navigation-hint">
                    {isTouchDevice ? (
                        <>
                            <span className="key-icon">←</span>
                            <span>スワイプ</span>
                            <span className="key-icon">→</span>
                        </>
                    ) : (
                        <>
                            <span className="key-icon">→</span>
                            <span id="navigationText">
                                {isAnswerShown ? 'キーを押して次の問題へ' : 'キーを押して解答を表示'}
                            </span>
                        </>
                    )}
                </div>
            </div>
          </>
        )}
      </div>

      {/* ★★★ このメインの quiz-card 部分を以下の内容で完全に置き換えてください！ ★★★ */}
      <div className="quiz-card" id="quizCard" style={{ minHeight: cardHeight }}>
        {!isQuizStarted ? (
          chapters.length > 0 ? (
            <ChapterSelection chapters={chapters} onSelectChapter={selectChapter} />
          ) : (
            <div style={{ textAlign: 'center', color: '#667eea' }}>
              <p className="text-xl animate-pulse">問題を読み込んでいます...</p>
            </div>
          )
        ) : !isQuizFinished && currentQuestion ? (
          <>
            <div className="quiz-content-wrapper" id="quizContentWrapper"> {/* quiz-content-wrapper を追加し、IDを付与 */}
              <div className="question-section"> {/* question-section を追加 */}
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="question-number">
                  問題 {currentQuestionIndex + 1} / {questions.length}
                </div>
                <div className="question" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontFamily: 'monospace' }} dangerouslySetInnerHTML={{ __html: currentQuestion.body }}>
                </div>
                {currentQuestion.imageUrl && (
                  <div className="question-image-container">
                    <img src={currentQuestion.imageUrl} alt="問題の図" className="question-image" />
                  </div>
                )}
                {!isAnswerShown && (
                  <div className="choices" id="choicesContainer">
                    <ChoiceList
                      choices={currentQuestion.choices}
                      correctChoiceIndex={currentQuestion.correctChoiceIndex}
                      isAnswerShown={isAnswerShown}
                    />
                  </div>
                )}
                {/* 解説パネルもquestion-section内に含めて一緒にスライドさせる */}
                <ExplanationPanel
                  choices={currentQuestion.choices}
                  correctChoiceIndex={currentQuestion.correctChoiceIndex}
                  isAnswerShown={isAnswerShown}
                  question={currentQuestion}
                />
              </div> {/* .question-section 終了 */}
            </div> {/* .quiz-content-wrapper 終了 */}

            {/* ナビゲーションヒントは固定したいので、quiz-content-wrapper の外、quiz-card の直下に残す */}
            <div className="navigation-hint">
              {isTouchDevice ? (
                <>
                  <span className="key-icon">←</span>
                  <span>スワイプ</span>
                  <span className="key-icon">→</span>
                </>
              ) : (
                <>
                  <span className="key-icon">→</span>
                  <span id="navigationText">
                    {isAnswerShown ? 'キーを押して次の問題へ' : 'キーを押して解答を表示'}
                  </span>
                </>
              )}
            </div>
          </>
        ) : (
          <ResultScreen
            score={score}
            totalQuestions={questions.length}
            onReset={reset}
            onBackToChapterSelect={backToChapterSelection}
          />
        )}
      </div>
      {/* ★★★ ここまで ★★★ */}
    </div>
  )
}

export default App