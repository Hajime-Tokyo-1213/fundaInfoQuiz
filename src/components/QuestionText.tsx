import React from 'react';

type Props = {
  text: string;
};

const QuestionText: React.FC<Props> = ({ text }) => {
  return (
    <div style={{ lineHeight: '1.6' }}>
      {text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </div>
  );
};

export default QuestionText;
