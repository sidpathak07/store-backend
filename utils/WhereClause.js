const { json } = require("express");

class WhereClause {
  constructor(base, bigQ) {
    this.base = base;
    this.bigQ = bigQ;
  }
  search() {
    let searchword = this.bigQ.search
      ? {
          name: {
            $regex: this.bigQ.search,
            $options: "g",
          },
        }
      : {};
    this.base = this.base.find({ ...searchword });
    return this;
  }

  filter() {
    let copyOfBigQ = { ...this.bigQ };
    delete copyOfBigQ["search"];
    delete copyOfBigQ["limit"];
    delete copyOfBigQ["page"];

    let stringOfCopyOfBigQ = JSON.stringify(copyOfBigQ);

    stringOfCopyOfBigQ = stringOfCopyOfBigQ.replace(
      /\b(gte|lte)\b/,
      (m) => `$${m}`
    );

    const jsonOfCopyQ = JSON.parse(stringOfCopyOfBigQ);
    this.base = this.base.find(jsonOfCopyQ);
    return this;
  }

  pager(resultperpage) {
    let currentpage = 1;
    if (this.bigQ.page) currentpage = this.bigQ.page;

    const skipval = resultperpage * (currentpage - 1);

    this.base = this.base.limit(resultperpage).skip(skipval);
    return this;
  }
}

module.exports = WhereClause;
