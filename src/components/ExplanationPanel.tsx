import { useMemo } from 'react';
import type { Choice, Question } from '../types/quiz';
import useQuizStore from '../store/quizStore';

interface Props {
  choices: Choice[];
  correctChoiceIndex: number;
  isAnswerShown: boolean;
  question: Question;
}

function ExplanationPanel({ choices, correctChoiceIndex, isAnswerShown, question }: Props) {
  const glossary = useQuizStore((state) => state.glossary);

  const relatedGlossaryTerms = useMemo(() => {
    if (!isAnswerShown || !question || !glossary) {
      return [];
    }

    const textToScan =
      question.body +
      ' ' +
      question.choices.map((c) => c.text).join(' ') +
      ' ' +
      question.choices.map((c) => c.explanation).join(' ');
      
    const foundTerms = Object.keys(glossary).filter((term) =>
      textToScan.includes(term)
    );

    return foundTerms.map((term) => ({
      term,
      explanation: glossary[term],
    }));
  }, [isAnswerShown, question, glossary]);

  if (!isAnswerShown) {
    return null;
  }

  return (
    <>
      <div className={`explanation-section ${isAnswerShown ? 'show' : ''}`}>
        <h3 className="explanation-title">
          <span>解説</span>
        </h3>
        {choices.map((choice, index) => (
          <div
            key={index}
            className={`explanation-item ${
              index === correctChoiceIndex ? 'correct-explanation' : ''
            }`}
          >
            <p className="explanation-choice">{choice.text}</p>
            <p className="explanation-text">{choice.explanation}</p>
          </div>
        ))}
      </div>
      {relatedGlossaryTerms.length > 0 && (
        <div className="glossary-section">
           <h3 className="explanation-title">
            <span>関連用語</span>
          </h3>
          {relatedGlossaryTerms.map((item) => (
            <div key={item.term} className="glossary-item">
              <p className="glossary-term">{item.term}</p>
              <p className="glossary-explanation">{item.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default ExplanationPanel; 