import {
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    debounceTime,
    fromEvent,
    Observable,
    Subject,
    Subscription,
    takeWhile,
} from 'rxjs';
import Node from 'src/classes/node';
import { Position } from 'src/types/position';

const NODE_RADIUS = 60;
const OFFSET = 10;
const OFFSET_BETWEEN_NODES = 100;
const TOTAL_NODE_WIDTH = NODE_RADIUS + OFFSET_BETWEEN_NODES;
const ARROW_WIDTH = 10;

@Component({
    selector: 'app-linked-list',
    templateUrl: './linked-list.component.html',
    styleUrls: ['./linked-list.component.scss'],
})
export class LinkedListComponent implements OnInit, OnDestroy {
    head: Node | undefined;
    head$ = new Subject<Node>();
    value = 1;

    resizeOberserver$!: Observable<Event>;

    height = window.innerHeight - 200;
    width = window.innerWidth - 20;

    isDestroyed = false;

    @ViewChild('canvas')
    canvas!: ElementRef<HTMLCanvasElement>;

    ctx!: CanvasRenderingContext2D;

    constructor() {}

    ngOnInit(): void {
        this.initListener();
    }

    ngOnDestroy(): void {
        this.isDestroyed = true;
    }

    initListener() {
        this.head$.subscribe((node) => {
            this.head = node;
            this.drawCanvas();
        });

        this.resizeOberserver$ = fromEvent(window, 'resize');
        this.resizeOberserver$
            .pipe(takeWhile(() => !this.isDestroyed))
            .subscribe(() => {
                this.clearCanvas();
                this.setCanvasDimensions();
                this.drawCanvas();
            });
    }

    ngAfterViewInit(): void {
        this.ctx = this.canvas.nativeElement.getContext(
            '2d'
        ) as CanvasRenderingContext2D;

        this.clearCanvas();
        this.setCanvasDimensions();
        this.drawCanvas();

        this.canvas.nativeElement.addEventListener('mousemove', (event) => {
            const rect = this.canvas.nativeElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const node = this.getNodeAtPosition({ x, y });

            if (node) {
                this.canvas.nativeElement.style.cursor = 'pointer';
            } else {
                this.canvas.nativeElement.style.cursor = 'auto';
            }
        });

        this.canvas.nativeElement.addEventListener('click', (event) => {
            const rect = this.canvas.nativeElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const node = this.getNodeAtPosition({ x, y });
            if (node) {
                this.deleteNode(node);
            }
        });
    }

    setCanvasDimensions() {
        this.height = window.innerHeight - 200;
        this.width = window.innerWidth - 20;
        this.canvas.nativeElement.height = this.height;
        this.canvas.nativeElement.width = this.width;
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    getNodePositions(row: number, col: number): Position {
        const x =
            OFFSET +
            NODE_RADIUS * col +
            col * OFFSET_BETWEEN_NODES +
            NODE_RADIUS / 2;
        const y = OFFSET + row * OFFSET_BETWEEN_NODES + NODE_RADIUS * (row + 1);

        return {
            x,
            y,
        };
    }

    getRow(index: number, nodesPerRow: number): number {
        return Math.floor(index / nodesPerRow);
    }

    getCol(index: number, nodesPerRow: number): number {
        return index % nodesPerRow;
    }

    getNodesPerRow() {
        return (
            Math.floor(
                (this.width - 2 * OFFSET - NODE_RADIUS) / TOTAL_NODE_WIDTH
            ) + 1
        );
    }

    drawLineToNextNode(
        node: Node,
        index: number,
        row: number,
        col: number
    ): void {
        if (node.next) {
            const nodesPerRow = this.getNodesPerRow();

            const { x, y } = this.getNodePositions(row, col);

            const nextRow = this.getRow(index + 1, nodesPerRow);
            const nextCol = this.getCol(index + 1, nodesPerRow);
            const { x: nextX, y: nextY } = this.getNodePositions(
                nextRow,
                nextCol
            );

            this.ctx.beginPath();
            if (row === nextRow) {
                const newX = nextX - NODE_RADIUS / 2;
                // Draw line to next node
                this.ctx.moveTo(x + NODE_RADIUS / 2, y);
                this.ctx.lineTo(newX - ARROW_WIDTH, nextY);

                // Draw top of arrow
                this.ctx.moveTo(newX - ARROW_WIDTH, nextY);
                this.ctx.lineTo(newX - ARROW_WIDTH, nextY + ARROW_WIDTH);
                this.ctx.moveTo(newX - ARROW_WIDTH, nextY + ARROW_WIDTH);
                this.ctx.lineTo(newX, nextY);

                // Draw bottom of arrow
                this.ctx.moveTo(newX - ARROW_WIDTH, nextY);
                this.ctx.lineTo(newX - ARROW_WIDTH, nextY - ARROW_WIDTH);
                this.ctx.moveTo(newX - ARROW_WIDTH, nextY - ARROW_WIDTH);
                this.ctx.lineTo(newX, nextY);
            } else {
                const newY = y + (OFFSET_BETWEEN_NODES + NODE_RADIUS) / 2;
                // Draw line downwoards
                this.ctx.moveTo(x, y + NODE_RADIUS / 2);
                this.ctx.lineTo(x, newY);

                // Draw line to the left
                this.ctx.moveTo(x, newY);
                this.ctx.lineTo(nextX, newY);

                // Draw line to next node
                this.ctx.moveTo(nextX, newY);
                this.ctx.lineTo(nextX, nextY - NODE_RADIUS / 2 - ARROW_WIDTH);

                // Draw left of arrow
                this.ctx.moveTo(nextX, nextY - NODE_RADIUS / 2 - ARROW_WIDTH);
                this.ctx.lineTo(
                    nextX - ARROW_WIDTH,
                    nextY - NODE_RADIUS / 2 - ARROW_WIDTH
                );
                this.ctx.moveTo(
                    nextX - ARROW_WIDTH,
                    nextY - NODE_RADIUS / 2 - ARROW_WIDTH
                );
                this.ctx.lineTo(nextX, nextY - NODE_RADIUS / 2);

                // Draw right of arrow
                this.ctx.moveTo(nextX, nextY - NODE_RADIUS / 2 - ARROW_WIDTH);
                this.ctx.lineTo(
                    nextX + ARROW_WIDTH,
                    nextY - NODE_RADIUS / 2 - ARROW_WIDTH
                );
                this.ctx.moveTo(
                    nextX + ARROW_WIDTH,
                    nextY - NODE_RADIUS / 2 - ARROW_WIDTH
                );
                this.ctx.lineTo(nextX, nextY - NODE_RADIUS / 2);
            }
            this.ctx.stroke();
        }
    }

    drawCanvas() {
        this.clearCanvas();

        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const nodesPerRow = this.getNodesPerRow();

        let index = 0;
        let current = this.head;

        while (current) {
            this.ctx.beginPath();
            const row = this.getRow(index, nodesPerRow);
            const col = this.getCol(index, nodesPerRow);

            const { x, y } = this.getNodePositions(row, col);
            current.position = { x, y };

            this.ctx.arc(x, y, NODE_RADIUS / 2, 0, 2 * Math.PI);
            this.ctx.fillText(current.val.toString(), x, y);
            this.ctx.stroke();

            this.drawLineToNextNode(current, index, row, col);
            current = current.next;
            index++;
        }
    }

    addNode() {
        let newHead = this.head;
        let current = this.head;

        while (current && current.next) {
            current = current.next;
        }

        const newNode = new Node(this.value++);
        if (current) {
            current.next = newNode;
        } else {
            newHead = newNode;
        }
        this.head$.next(newHead!);
    }

    getNodeAtPosition({ x, y }: Position): Node | undefined {
        let current = this.head;

        while (current) {
            if (this.isNodeHovered(current, { x, y })) {
                return current;
            }
            current = current.next;
        }

        return undefined;
    }

    isNodeHovered(node: Node, position: Position): boolean {
        if (!node.position) {
            return false;
        }

        const d = Math.sqrt(
            Math.pow(position.x - node.position.x, 2) +
                Math.pow(position.y - node.position.y, 2)
        );
        return d <= NODE_RADIUS / 2;
    }

    deleteNode(node: Node) {
        let newHead = this.head;
        let current = this.head;
        let prev = undefined;

        while (current) {
            if (current === node) {
                if (prev) {
                    prev.next = current.next;
                } else {
                    newHead = current.next;
                }
            }
            prev = current;
            current = current.next;
        }

        this.head$.next(newHead!);
    }
}
