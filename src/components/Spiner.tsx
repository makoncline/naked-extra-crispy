import styled from "styled-components";

export const Spinner = ({ scale }: { scale?: number }) => {
  return (
    <ScSpiner
      css={`
        --scale: ${scale || 1};
      `}
    >
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </ScSpiner>
  );
};

const ScSpiner = styled.div`
  display: inline-block;
  position: relative;
  --baseSize: 80px;
  --base0: 6px;
  --base1: 7px;
  --base2: 11px;
  --base3: 22px;
  --base4: 37px;
  --base5: 52px;
  --base6: 62px;
  --base7: 66px;
  --size: calc(var(--baseSize) * var(--scale));
  --0: calc(var(--base0) * var(--scale));
  --1: calc(var(--base1) * var(--scale));
  --2: calc(var(--base2) * var(--scale));
  --3: calc(var(--base3) * var(--scale));
  --4: calc(var(--base4) * var(--scale));
  --5: calc(var(--base5) * var(--scale));
  --6: calc(var(--base6) * var(--scale));
  --7: calc(var(--base7) * var(--scale));

  width: var(--size);
  height: var(--size);
  & div {
    position: absolute;
    width: var(--0);
    height: var(--0);
    background: #fff;
    border-radius: 50%;
    animation: lds-default 1.2s linear infinite;
  }
  & div:nth-child(1) {
    animation-delay: 0s;
    top: var(--4);
    left: var(--7);
  }
  & div:nth-child(2) {
    animation-delay: -0.1s;
    top: var(--3);
    left: var(--6);
  }
  & div:nth-child(3) {
    animation-delay: -0.2s;
    top: var(--2);
    left: var(--5);
  }
  & div:nth-child(4) {
    animation-delay: -0.3s;
    top: var(--1);
    left: var(--4);
  }
  & div:nth-child(5) {
    animation-delay: -0.4s;
    top: var(--2);
    left: var(--3);
  }
  & div:nth-child(6) {
    animation-delay: -0.5s;
    top: var(--3);
    left: var(--2);
  }
  & div:nth-child(7) {
    animation-delay: -0.6s;
    top: var(--4);
    left: var(--1);
  }
  & div:nth-child(8) {
    animation-delay: -0.7s;
    top: var(--5);
    left: var(--2);
  }
  & div:nth-child(9) {
    animation-delay: -0.8s;
    top: var(--6);
    left: var(--3);
  }
  & div:nth-child(10) {
    animation-delay: -0.9s;
    top: var(--7);
    left: var(--4);
  }
  & div:nth-child(11) {
    animation-delay: -1s;
    top: var(--6);
    left: var(--5);
  }
  & div:nth-child(12) {
    animation-delay: -1.1s;
    top: var(--5);
    left: var(--6);
  }
  @keyframes lds-default {
    0%,
    20%,
    80%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.5);
    }
  }
`;
