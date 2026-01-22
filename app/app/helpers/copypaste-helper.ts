interface TextUpdateType {
  index: number;
  added?: string;
  deleted?: string;
}

export const CopypasteHelper = {
  reconstructedText: <string>"",

  getDifferenceStart(newText: string, oldText: string): number {
    const lengthToCheck = Math.min(newText.length, oldText.length);

    let i: number = 0;
    while (i < lengthToCheck && newText[i] === oldText[i]) {
      i++;
    }
    return i;
  },

  getTextDifferences(newText: string, oldText: string): TextUpdateType | null {
    const start = this.getDifferenceStart(newText, oldText);
    console.log("IT STARTS AT: " + start?.toString());

    let oldEnd = oldText.length - 1;
    let newEnd = newText.length - 1;
    while (newEnd >= 0 && oldEnd >= 0 && oldText[oldEnd] === newText[newEnd]) {
      oldEnd--;
      newEnd--;
    }

    const deleted = oldText.slice(start, oldEnd + 1);
    const inserted = newText.slice(start, newEnd + 1);

    console.log("DELETED: " + deleted);
    console.log("INSERTED: " + inserted);

    let finalObj: TextUpdateType = {
      index: start,
    };

    return finalObj;
  },
};
