import { createElement as h, Component, render } from '../../src/index';
import { setupScratch, teardown } from '../_util/helpers';
import { spy } from 'sinon';

/** @jsx h */

describe('keys', () => {

	/** @type {HTMLDivElement} */
	let scratch;

	/** @type {(props: {values: any[]}) => any} */
	const List = props => (
		<ol>
			{props.values.map(value => <li key={value}>{value}</li>)}
		</ol>
	);

	/**
	 * Move an element in an array from one index to another
	 * @param {any[]} values The array of values
	 * @param {number} from The index to move from
	 * @param {number} to The index to move to
	 */
	function move(values, from, to) {
		const value = values[from];
		values.splice(from, 1);
		values.splice(to, 0, value);
	}

	beforeEach(() => {
		scratch = setupScratch();
	});

	afterEach(() => {
		teardown(scratch);
	});

	// https://fb.me/react-special-props
	it('should not pass key in props', () => {
		const Foo = spy(() => null);
		render(<Foo key="foo" />, scratch);
		expect(Foo.args[0][0]).to.deep.equal({});
	});

	// See developit/preact-compat#21
	it('should remove orphaned keyed nodes', () => {
		render((
			<div>
				<div>1</div>
				<li key="a">a</li>
				<li key="b">b</li>
			</div>
		), scratch);

		render((
			<div>
				<div>2</div>
				<li key="b">b</li>
				<li key="c">c</li>
			</div>
		), scratch);

		expect(scratch.innerHTML).to.equal('<div><div>2</div><li>b</li><li>c</li></div>');
	});

	it('should remove keyed nodes (#232)', () => {
		class App extends Component {
			componentDidMount() {
				setTimeout(() => this.setState({ opened: true,loading: true }), 10);
				setTimeout(() => this.setState({ opened: true,loading: false }), 20);
			}

			render({ opened, loading }) {
				return (
					<BusyIndicator id="app" busy={loading}>
						<div>This div needs to be here for this to break</div>
						{ opened && !loading && <div>{[]}</div> }
					</BusyIndicator>
				);
			}
		}

		class BusyIndicator extends Component {
			render({ children, busy }) {
				return (<div class={busy ? 'busy' : ''}>
					{ children && children.length ? children : <div class="busy-placeholder" /> }
					<div class="indicator">
						<div>indicator</div>
						<div>indicator</div>
						<div>indicator</div>
					</div>
				</div>);
			}
		}

		render(<App />, scratch);
		render(<App opened loading />, scratch);
		render(<App opened />, scratch);

		const html = String(scratch.firstChild.innerHTML).replace(/ class=""/g, '');
		expect(html).to.equal('<div>This div needs to be here for this to break</div><div></div><div class="indicator"><div>indicator</div><div>indicator</div><div>indicator</div></div>');
	});

	it('should append new keyed elements', () => {
		const values = ['a', 'b'];

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('ab');

		values.push('c');

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abc');
	});

	it('should remove keyed elements from the end', () => {
		const values = ['a', 'b', 'c', 'd'];

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abcd');

		values.pop();

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abc');
	});

	it('should prepend keyed elements to the beginning', () => {
		const values = ['b', 'c'];

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('bc');

		values.unshift('a');

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abc');
	});

	it('should remove keyed elements from the beginning', () => {
		const values = ['z', 'a', 'b', 'c'];

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('zabc');

		values.shift();

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abc');
	});

	it('should insert new keyed children in the middle', () => {
		const values = ['a', 'c'];

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('ac');

		values.splice(1, 0, 'b');

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abc');
	});

	it('should remove keyed children from the middle', () => {
		const values = ['a', 'b', 'z', 'c', 'd'];

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abzcd');

		values.splice(2, 1);

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abcd');
	});

	it('should swap existing keyed children', () => {
		const values = ['a', 'b', 'c', 'd'];

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abcd');

		// swap
		move(values, 1, 2);

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('acbd');

		// swap back
		move(values, 2, 1);

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abcd');
	});

	it('should move keyed children to the end of the list', () => {
		const values = ['a', 'b', 'c', 'd'];

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abcd');

		// move to end
		move(values, 0, values.length - 1);

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('bcda');

		// move to beginning
		move(values, values.length - 1, 0);

		render(<List values={values} />, scratch);
		expect(scratch.textContent).to.equal('abcd');
	});
});
