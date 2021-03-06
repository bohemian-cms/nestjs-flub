import * as stackTrace from 'stack-trace';
import { IOptions } from '../interfaces/options.interface';
import { FrameParser } from './frame-parser';

export class ErrorParser {
    public viewQuote: boolean = true;
    private readonly error: any;
    constructor(error, options?: IOptions) {
        this.error = error;
        this.viewQuote = options.quote;
    }

  /**
   * Serializes stack to Mustache friendly object to
   * be used within the view. Optionally can pass
   * a callback to customize the frames output.
   *
   * @param  {Object} stack
   * @param  {Function} [callback]
   *
   * @return {Object}
   */
    public serialize(stack: object, callback?): object {
        callback = callback || FrameParser.serializeCodeFrame.bind(this);
        let frames = [];
        if (stack instanceof Array) {
            frames = stack.filter((frame) => frame.getFileName()).map(callback);
        }
        return {
            frames,
            message: this.error.message,
            name: this.error.name,
            quote: this.viewQuote ? this.randomQuote() : undefined,
            status: this.error.status,
        };
    }

  /**
   * Parses the error stack and returns serialized
   * frames out of it.
   *
   * @return {Promise<Object>}
   */
    public parse(): Promise<object> {
        return new Promise((resolve, reject) => {
            const stack = stackTrace.parse(this.error);
            Promise.all(stack.map((frame) => {
                if (FrameParser.isNode(frame)) {
                    return Promise.resolve(frame);
                }
                return FrameParser.readCodeFrame(frame).then((context) => {
                    frame.context = context;
                    return frame;
                });
            })).then(resolve).catch(reject);
        });
    }
    private randomQuote(): string {
        const quotes: string[] = [
            `Always remember that your present situation is not your final destination.
            The best is yet to come.`, `Life does not have to be perfect to be wonderful.`,
            `You’re always one decision away from a totally different life.`,
            `No matter how you feel – get up, show up and never give up.`,
            `Overthinking will destroy your mood. Breathe and let go.`,
            `It's hard to beat a person who never gives up.`,
            `Success isn't permanent and failure isn't fatal; it's the courage to continue that counts.`,
            `You make mistakes. Mistakes don't make you.`,
            `It's just a bad day. Not a bad life.`,
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }
}
