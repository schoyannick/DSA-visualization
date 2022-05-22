class Node {
    val: number;
    next?: Node;
    
    constructor(val = 0, next?: Node) {
        this.val = val;
        this.next = next;
    }
}

export default Node;
