import { Position } from 'src/types/position';

class Node {
    val: number;
    next?: Node;
    position?: Position;

    constructor(val = 0, next?: Node, position?: Position) {
        this.val = val;
        this.next = next;
        this.position = position;
    }
}

export default Node;
