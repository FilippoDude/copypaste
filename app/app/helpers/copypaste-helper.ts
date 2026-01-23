interface TextUpdate {
  index: number;
  added: string;
  deleted: string;
}

export const CopypasteHelper = {
  reconstructedText: <string>"",

  TESTaddOrRemoveToOld(textUpdate: TextUpdate) {
    const firstPart = this.reconstructedText.substring(0, textUpdate.index);
    const secondPart = this.reconstructedText.substring(
      textUpdate.index + textUpdate.deleted.length,
      this.reconstructedText.length,
    );

    const textWithRemoved = firstPart + textUpdate.added + secondPart;
    console.log(textWithRemoved);
    this.reconstructedText = textWithRemoved;
  },

  getDifferenceStart(newText: string, oldText: string): number {
    const lengthToCheck = Math.min(newText.length, oldText.length);

    let i: number = 0;
    while (i < lengthToCheck && newText[i] === oldText[i]) {
      i++;
    }
    return i;
  },

  // Returns added and deleted text between two texts
  getTextDifferences(newText: string, oldText: string): TextUpdate | null {
    const start = this.getDifferenceStart(newText, oldText);

    let oldEnd = oldText.length - 1;
    let newEnd = newText.length - 1;
    while (
      newEnd >= start &&
      oldEnd >= start &&
      oldText[oldEnd] === newText[newEnd]
    ) {
      oldEnd--;
      newEnd--;
    }

    const deleted = oldText.slice(start, oldEnd + 1);
    const added = newText.slice(start, newEnd + 1);

    console.log("IT STARTS AT: " + start.toString());
    console.log("DELETED: " + deleted);
    console.log("INSERTED: " + added);

    let finalObj: TextUpdate = {
      index: start,
      added: added,
      deleted: deleted,
    };
    this.TESTaddOrRemoveToOld(finalObj);
    return finalObj;
  },
};
