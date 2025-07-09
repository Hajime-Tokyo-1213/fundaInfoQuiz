import React from 'react';

type Props = {
  text: string;
};

const Hello: React.FC<Props> = ({ text }) => {
  return <div style={{ whiteSpace: 'pre-line' }}>{text}</div>;
};

export default Hello;
