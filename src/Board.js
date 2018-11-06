import React, { Component } from 'react';
import axios from 'axios';
import './Board.css';
import Dealer from './Dealer';
import Player from './Player';
import uuid from 'uuid/v4';

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      dealer: [],
      player: [],
      playerTurn: true
    };
    this.handleStartHand = this.handleStartHand.bind(this);
    this.handleHit = this.handleHit.bind(this);
  }

  async componentDidMount() {
    let deck = await axios.get(
      'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1'
    );

    this.setState({
      deckID: deck.data.deck_id,
      remaining: deck.data.remaining,
      loading: false
    });
  }

  async handleHit(currentPerson) {
    let card = await axios.get(
      `https://deckofcardsapi.com/api/deck/${this.state.deckID}/draw/?count=1`
    );

    card.data.cards[0].key = uuid();

    this.setState(st => ({
      [currentPerson]: [...st[currentPerson], card.data.cards[0]],
      remaining: card.data.remaining
    }));
  }

  async handleStay() {
    this.setState({ playerTurn: false });
    await this.handleHit();
  }

  async handleStartHand() {
    let card;
    let playerHand = [];
    let dealerHand = [];
    for (let i = 0; i < 4; i++) {
      card = await axios.get(
        `https://deckofcardsapi.com/api/deck/${this.state.deckID}/draw/?count=1`
      );

      card.data.cards[0].key = uuid();
      card.data.cards[0] = this.convertFaceCards(card.data.cards[0]);

      if (i % 2 === 0) playerHand.push(card);
      else dealerHand.push(card);
    }

    this.setState(st => ({
      dealer: dealerHand,
      player: playerHand
    }));
  }

  convertFaceCards(card) {
    if (
      card.value === 'KING' ||
      card.value === 'QUEEN' ||
      card.value === 'JACK'
    ) {
      card.value = '10';
    }
    return card;
  }

  render() {
    return (
      <div className="Board">
        <button onClick={this.handleStartHand}>DEAL</button>
        <Dealer dealer={this.state.dealer} />
        <Player player={this.state.player} handleHit={this.handleHit} />
      </div>
    );
  }
}

export default Board;
