import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  const className = 'square' + (props.highlight ? ' highlight' : '');
  return (
    <button
      className={className}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    const winLine = this.props.winLine;
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlight={winLine && winLine.includes(i)}
      />
    );
  }

  render() {
    var rows = [];
    var children = [];
    for (var i = 0; i < 3; i++) {
      children = [];
      for (var j = 0; j < 3; j++) {
        children.push(this.renderSquare((i*2)+i+j))
      }
      rows.push(<div className="board-row" key={i}>{children}</div>);
    }
    return (
      <div>
        {rows}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      moveListReverse: false,
    };
  }
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares).winner || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        location: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }
  changeOrder() {
    this.setState({
      moveListReverse: !this.state.moveListReverse,
    })
  }
  render() {
    const history = this.state.history;
    const stepNumber = this.state.stepNumber;
    const current = history[stepNumber];
    const winInfo = calculateWinner(current.squares);
    const winner = winInfo.winner;
    const isDraw = winInfo.isDraw;

    const moves = history.map((step, move) => {
      const location = getXy(step.location);
      const desc = move ?
        'Go to move #' + move + ' (' + location.x + ',' + location.y + ')' :
        'Go to game start';
      return (
        <li key={move}>
          <button
            className={move === stepNumber ? 'move-list-item-selected' : ''}
            onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      )
    })

    if (this.state.moveListReverse) {
      moves.reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (isDraw) {
      status = 'Game is a drawer';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board 
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winLine={winInfo.line}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <button onClick={() => this.changeOrder()}>Reverse Order</button>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner:squares[a],
        line: lines[i],
        isDraw: false,
      };
    }
  }
  let isDraw = true;
  for (let i = 0; i < squares.length; i++) {
    if (!squares[i]) {
      isDraw = false;
    }
  }
  return {
    winner:null,
    isDraw: isDraw,
  }
}

function getXy(i) {
  const x = (i % 3)+1;
  const y =  Math.floor(i / 3)+1;
  return {
    x: x,
    y: y,
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);