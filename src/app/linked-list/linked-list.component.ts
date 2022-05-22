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

const NODE_RADIUS = 60;
const OFFSET = 10;
const OFFSET_BETWEEN_NODES = 100;
const TOTAL_NODE_WIDTH = NODE_RADIUS + OFFSET_BETWEEN_NODES;

type Position = {
    x: number;
    y: number;
};

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
    resizeSubscription$!: Subscription;

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

        // this.canvas.nativeElement.addEventListener('mousemove', (event) => {
        //     const rect = this.canvas.nativeElement.getBoundingClientRect();
        //     const x = event.clientX - rect.left;
        //     const y = event.clientY - rect.top;
        //     console.log('move', x, y);
        // });
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
                this.ctx.moveTo(x + NODE_RADIUS / 2, y);
                this.ctx.lineTo(nextX - NODE_RADIUS / 2, nextY);
            } else {
                const calcYpos = y + (OFFSET_BETWEEN_NODES + NODE_RADIUS) / 2;
                this.ctx.moveTo(x, y + NODE_RADIUS / 2);
                this.ctx.lineTo(x, calcYpos);

                this.ctx.moveTo(x, calcYpos);
                this.ctx.lineTo(nextX, calcYpos);

                this.ctx.moveTo(nextX, calcYpos);
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

        let index = -1;
        let current = this.head;

        while (current) {
            index++;
            this.ctx.beginPath();
            const row = this.getRow(index, nodesPerRow);
            const col = this.getCol(index, nodesPerRow);

            const { x, y } = this.getNodePositions(row, col);

            this.ctx.arc(x, y, NODE_RADIUS / 2, 0, 2 * Math.PI);
            this.ctx.fillText(current.val.toString(), x, y);
            this.ctx.stroke();

            this.drawLineToNextNode(current, index, row, col);
            current = current.next;
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
}