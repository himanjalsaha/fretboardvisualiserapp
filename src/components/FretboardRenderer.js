import Snap from 'snapsvg-cjs';

import { STRING_TUNINGS, ARPEGGIOS } from '../MusicalConstants';
import { getOverallNotePosition, getSequenceNotes } from './MusicalUtilities';

const FRET_COUNT = 13,
  STRING_COUNT = STRING_TUNINGS.length,
  STRING_START_POINT_X = 30,
  STRING_START_POINT_Y = 30,
  STRING_SPACING = 60,
  STRING_WIDTH = 2,
  FRET_WIDTH = 6,
  FRET_START_POINT_X = STRING_START_POINT_X,
  FRET_START_POINT_Y = STRING_START_POINT_Y + FRET_WIDTH / 2,
  FRET_SPACING = 80,
  STRING_LENGTH = FRET_COUNT * (FRET_SPACING + 1),
  FRET_HEIGHT = STRING_COUNT * (STRING_SPACING - 1) - 32;

class FretboardRenderer {
  snapInstance;
  currentRoot;
  currentScale;
  currentArpeggio;
  showNotes;
  showScales;

  constructor(svgElementSelector, initialConfig) {
    this.snapInstance = Snap(svgElementSelector);
    this.currentRoot = initialConfig.currentRoot;
    this.currentScale = initialConfig.currentScale;
    this.currentArpeggio = initialConfig.currentArpeggio;
    this.showNotes = initialConfig.showNotes;
    this.showScales = initialConfig.showScales;
  }

  updateWithRoot(root) {
    this.currentRoot = root;
    this.drawFretboard();
  }

  updateWithScale(scale) {
    this.currentScale = scale;
    this.showScales = true;
    this.drawFretboard();
  }

  updateWithArpeggio(arpeggio) {
    this.currentArpeggio = arpeggio;
    this.showScales = false;
    this.drawFretboard();
  }

  showNoteMarkers() {
    this.showNotes = true;
    this.drawFretboard();
  }

  showDegreeMarkers() {
    this.showNotes = false;
    this.drawFretboard();
  }

  drawFretboard() {
    this.snapInstance.clear();
    this._drawStrings();
    this._drawFrets();
    this._drawPositionMarkers();
    this._drawNotePositions();
  }

  _drawStrings() {
    for (var i = 0; i < STRING_COUNT; i++) {
      var xPosition = STRING_START_POINT_X + i * STRING_SPACING;
      this._drawStringLine(xPosition);
      this._addStringLabel(xPosition, STRING_TUNINGS[i].note);
    }
  }

  _drawStringLine(xPosition) {
    var stringLine = this.snapInstance.line(xPosition, STRING_START_POINT_Y, xPosition, STRING_START_POINT_Y + STRING_LENGTH);
    stringLine.attr({
      stroke: "white",
      strokeWidth: STRING_WIDTH
    });
    return stringLine;
  }

  _addStringLabel(xPosition, labelText) {
    const LABEL_OFFSET = 7;
    var stringLabel = this.snapInstance.text(xPosition - LABEL_OFFSET, 15, labelText);
    stringLabel.attr({
      fontWeight: "bold",
      fontSize: "1.5em"
    });
  }

  _drawFrets() {
    for (var j = 0; j < FRET_COUNT; j++) {
      var yPosition = FRET_START_POINT_Y + j * FRET_SPACING;
      this._drawFretLine(yPosition);
    }
  }

  _drawFretLine(yPosition) {
    var fret = this.snapInstance.line(FRET_START_POINT_X, yPosition, FRET_HEIGHT, yPosition);
    fret.attr({
      stroke: "white",
      strokeWidth: FRET_WIDTH
    });
  }

  _drawPositionMarkers() {
    [3, 5, 7, 9, 12].forEach(position => {
      if (position === 12) {
        this._drawPositionMarker(FRET_HEIGHT / 3 + 2 * STRING_WIDTH + 2, position * FRET_SPACING - 7);
        this._drawPositionMarker(2 * FRET_HEIGHT / 3 + 4 * STRING_WIDTH + 4, position * FRET_SPACING - 7);
      }
      else {
        this._drawPositionMarker(FRET_HEIGHT / 2 + 3 * STRING_WIDTH + 2, position * FRET_SPACING - 7);
      }
    });
  }

  _drawPositionMarker(xPosition, yPosition) {
    const RADIUS = 4;
    var positionMarker = this.snapInstance.circle(xPosition, yPosition, RADIUS);
    positionMarker.attr({
      fill: "#000",
      stroke: "#000",
      strokeWidth: 3
    });
  }

  _drawNotePositions() {
    STRING_TUNINGS.forEach(string => {
      var scaleNotes = getSequenceNotes(this.currentRoot, this._getCurrentSequence());
      scaleNotes.forEach(scaleIntervalElement => {
        this._drawNoteMarker(getOverallNotePosition(scaleIntervalElement.note, string.note.toUpperCase()), string.stringNumber, scaleIntervalElement);
      });
    });
  }

  _getCurrentSequence() {
    if (this.showScales) {
      return this.currentScale;
    } else {
      return ARPEGGIOS.find(arpeggio => {
        return this.currentArpeggio === arpeggio.name;
      }).intervals;
    }
  }

  _drawNoteMarker(fretPosition, stringNumber, scaleIntervalElement) {
    const POSITION_MARKER_RADIUS = 15,
      STRING_NUMBER_ADJUSTMENT = (STRING_COUNT - stringNumber) * STRING_SPACING,
      Y_POSITION = fretPosition * FRET_SPACING + FRET_START_POINT_Y,
      X_POSITION = STRING_START_POINT_X + STRING_NUMBER_ADJUSTMENT;

    var marker = this.snapInstance.circle(X_POSITION, Y_POSITION, POSITION_MARKER_RADIUS);
    marker.attr({
      fill: this._getMarkerFillColour(scaleIntervalElement.degree),
      stroke: "#000",
      strokeWidth: 3
    });

    var markerLabel = this.showNotes ? scaleIntervalElement.note : scaleIntervalElement.degree;
    this.snapInstance.text(this._getMarkerLabelXPosition(markerLabel, X_POSITION), Y_POSITION + 5, markerLabel);
  }

  _getMarkerFillColour(degree) {
    var colour;
    switch (degree) {
      case 1:
        colour = "#ff7f7f";
        break;
      case 3:
        colour = "#7fbf7f";
        break;
      case 5:
        colour = "#bfbfbf";
        break;
      case 7:
        colour = "#bf7fbf";
        break;
      default:
        colour = "#fff";
        break;
    }
    return colour;
  }

  _getMarkerLabelXPosition(markerLabel, circleXPosition) {
    var X_POSITION;
    switch (markerLabel) {
      case 'A':
        X_POSITION = circleXPosition - 5;
        break;
      case 'A#':
        X_POSITION = circleXPosition - 9;
        break;
      case 'B':
        X_POSITION = circleXPosition - 5;
        break;
      case 'C':
        X_POSITION = circleXPosition - 6;
        break;
      case 'C#':
        X_POSITION = circleXPosition - 10;
        break;
      case 'D':
        X_POSITION = circleXPosition - 5;
        break;
      case 'D#':
        X_POSITION = circleXPosition - 10;
        break;
      case 'E':
        X_POSITION = circleXPosition - 5;
        break;
      case 'F#':
        X_POSITION = circleXPosition - 9;
        break;
      case 'G':
        X_POSITION = circleXPosition - 6;
        break;
      case 'G#':
        X_POSITION = circleXPosition - 10.5;
        break;
      default:
        X_POSITION = circleXPosition - 4.5;
    }
    return X_POSITION;
  }
}

export default FretboardRenderer;
