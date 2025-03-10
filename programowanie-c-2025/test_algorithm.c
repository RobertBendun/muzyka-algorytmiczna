#include "algorithm.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void test_swap_ints();
void test_swap();
void test_da_index();

int main()
{
	test_swap_ints();
	test_swap();
	test_da_index();

	return 0;
}

#define expect(test, func, message, ...) \
	if (!(test)) { printf("%s:%d: " func " failed: " message "\n", __FILE__, __LINE__, __VA_ARGS__); exit(1); }

void test_swap_ints()
{
	int a = 40;
	int b = 30;

	swap_ints(&a, &b);
	expect(a == 30, "test_swap_ints", "expected a=30, got a=%d", a);
	expect(b == 40, "test_swap_ints", "expected b=40, got b=%d", b);
}

void test_swap()
{
	{
		int a = 40;
		int b = 30;

		swap(&a, &b, sizeof(a));
		expect(a == 30, "test_swap", "expected a=30, got a=%d", a);
		expect(b == 40, "test_swap", "expected b=40, got b=%d", b);
	}

	{
		double a = 3.14;
		double b = 6.28;

		swap(&a, &b, sizeof(a));
		expect(a == 6.28, "test_swap", "expected a=6.28, got a=%f", a);
		expect(b == 3.14, "test_swap", "expected b=3.14, got b=%f", b);
	}

	{
		char a[] = "foo";
		char b[] = "bar";

		swap(&a, &b, strlen(a));
		expect(strcmp(a, "bar") == 0, "test_swap", "expected a=6.28, got a=%s", a);
		expect(strcmp(b, "foo") == 0, "test_swap", "expected b=3.14, got b=%s", b);
	}
}

void test_da_index()
{
	int *a = NULL, n = 0, *res, i;

	res = da_index(&a, &n, 0);

	expect(a != NULL, "test_da_index", "expected a to be allocated, got NULL", 0);
	expect(n > 0, "test_da_index", "expected size to be > 0, got %d", n);
	expect(a == res, "test_da_index", "expected index 0 to return start of the array", 0);

	a[0] = 42;

	res = da_index(&a, &n, 100);

	expect(a != NULL, "test_da_index", "expected a to be allocated, got NULL", 0);
	expect(n > 100, "test_da_index", "expected size to be > 100, got %d", n);
	expect(a[0] == 42, "test_da_index", "expected 0 element to retain previous value (42), got: %d", a[0]);


	for (i = 1; i < n && a[i] == 0; ++i) {}
	expect(i == n, "test_da_index", "expected all elements besides 0th one to be zero, element %d differs with value: %d", i, a[i]);

	free(a);
}
