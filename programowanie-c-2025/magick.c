#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>

/*
    ./magick input.ppm -flip output.ppm
*/

void save_ppm(uint32_t *image, size_t width, size_t height, FILE *out)
{
    // RRGGBB <- uint32_t
    fprintf(out, "P6\n");
    fprintf(out, "%zu %zu\n", width, height);
    fprintf(out, "255\n");
    for (int x = 0; x < width; ++x) {
        for (int y = 0; y < height; ++y) {
            uint32_t c = image[x * width + height];
            fwrite(&c, 3, 1, out);
        }
    }
}

// argument counter
// string[] argument value
int main(int argc, char* argv[])
{
    if (argc < 2) {
        printf("%s: error: no input file\n", argv[0]);
        return 1;
    }
    char const *input_file_path = argv[1];

    if (argc < 3) {
        printf("%s: error: no flags\n", argv[0]);
        return 1;
    }
    char const *flag = argv[2];

    if (argc < 4) {
        printf("%s: error: no output file\n", argv[0]);
        return 1;
    }
    char const *output_file_path = argv[3];

    printf("in = %s\n", input_file_path);
    printf("out = %s\n", output_file_path);
    printf("flag = %s\n", flag);

    FILE *input = fopen(input_file_path, "r");
    if (!input) {
        printf("%s: error: %s: couldn't open file\n", argv[0], input_file_path);
        return 1;
    }

    FILE *output = fopen(output_file_path, "w");
    if (!output) {
        fclose(input);
        printf("%s: error: %s: couldn't open file\n", argv[0], output_file_path);
        return 1;
    }

    size_t width = 32;
    size_t height = 32;
    uint32_t *image = malloc(sizeof(int) * width * height);

    for (int i = 0; i < width; ++i) {
        for (int j = 0; j < height; ++j) {
            image[i * width + j] = 0x0000ff;
        }
    }

    save_ppm(image, width, height, output);

    free(image);
    fclose(input);
    fclose(output);
    return 0;
}