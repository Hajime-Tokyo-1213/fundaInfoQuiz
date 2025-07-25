// useSwipeNav.ts
import { useEffect, useRef } from 'react';
import useQuizStore from '../store/quizStore';

const SWIPE_THRESHOLD = 50; // 50px以上スワイプされたら検知

export function useSwipeNav() {
  const {
    goToNextQuestion,
    goToPrevQuestion,
    setShowAnswer,
    isAnswerShown,
    isQuizFinished,
    isQuizStarted,
  } = useQuizStore();

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  // ★★★ ここを修正：quizCardRefではなくquizContentWrapperRefを使う ★★★
  const quizContentWrapperRef = useRef<HTMLElement | null>(null); 
  // ★★★ ここまで ★★★


  // スワイプ開始時
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
    // ★★★ ここを修正：quizContentWrapperRef に変更 ★★★
    if (quizContentWrapperRef.current) {
      quizContentWrapperRef.current.style.transition = 'none'; // スワイプ開始時にトランジションを一時的に無効にする
    }
  };

  // スワイプ中
  const handleTouchMove = (e: TouchEvent) => {
    if (!isQuizStarted || isQuizFinished) return;

    const deltaX = e.changedTouches[0].screenX - touchStartX.current;
    const deltaY = e.changedTouches[0].screenY - touchStartY.current;

    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }
    
    e.preventDefault(); 
    
    // ★★★ ここを修正：quizContentWrapperRef に変更 ★★★
    if (quizContentWrapperRef.current) {
      quizContentWrapperRef.current.style.transform = `translateX(${deltaX}px)`;
    }
  };

  // スワイプ終了時
  const handleTouchEnd = (e: TouchEvent) => {
    if (!isQuizStarted || isQuizFinished) return;

    const deltaX = e.changedTouches[0].screenX - touchStartX.current;
    
    // ★★★ ここを修正：quizContentWrapperRef に変更 ★★★
    if (quizContentWrapperRef.current) {
      quizContentWrapperRef.current.style.transition = 'transform 0.3s ease-out'; // CSSのtransitionと合わせる
      quizContentWrapperRef.current.style.transform = 'translateX(0)'; // カードを元の位置に戻す
    }

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX < 0) { // 左スワイプ
        if (!isAnswerShown) {
          setShowAnswer(true);
        } else {
          goToNextQuestion();
        }
      } else { // 右スワイプ
        goToPrevQuestion();
      }
    }
  };
  
  // ★★★ ここを修正：quizContentWrapper のIDを取得するように変更 ★★★
  useEffect(() => {
    quizContentWrapperRef.current = document.getElementById('quizContentWrapper'); // App.tsxでid="quizContentWrapper"を設定しているため
  }, []); 

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToNextQuestion, goToPrevQuestion, setShowAnswer, isAnswerShown, isQuizStarted, isQuizFinished]);
}